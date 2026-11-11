(function () {
  var JEDA_LANGKAH = 1400;   // jeda minimum tiap langkah (ms), supaya pemeriksaan terbaca. Makin besar makin lambat.
  var JEDA_AWAL = 1200;      // jeda sebelum pemeriksaan pertama (ms)
  var JEDA_TUTUP = 3500;     // lama layar "STAY CONNECTED" sebelum menutup sendiri (ms)
  var AWAL_HITUNG = "2026-10-19";   // tanggal awal bilah menuju Ramadan

  var STATUS = window.STATUS = { ayat: null, hadis: null };
  window.kabar = function (kunci, nilai) {
    STATUS[kunci] = nilai;
    try { document.dispatchEvent(new CustomEvent("ramadhan-status")); } catch (e) {}
  };

  function $(id) { return document.getElementById(id); }
  var kv = document.querySelector(".kanvas");
  var nav = document.querySelector(".titik");

  /* ---------- jam WIB, hitung mundur 00.00 WIB, dan bilah menuju Ramadan ---------- */
  var fJam = null, fBagian = null, fTgl = null;
  try {
    fJam = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    fBagian = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    fTgl = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" });
  } catch (e) {}
  function jamWIB(d) { return fJam ? fJam.format(d).replace(/:/g, ".") : "--.--.--"; }
  function dua(n) { return (n < 10 ? "0" : "") + n; }
  function sisaHari() {
    if (!fBagian) return null;
    var h = 0, m = 0, s = 0, p = fBagian.formatToParts(new Date());
    for (var i = 0; i < p.length; i++) {
      if (p[i].type === "hour") h = parseInt(p[i].value, 10) % 24;
      if (p[i].type === "minute") m = parseInt(p[i].value, 10);
      if (p[i].type === "second") s = parseInt(p[i].value, 10);
    }
    return 86400 - (h * 3600 + m * 60 + s);
  }
  function nomorTgl(s) { var p = s.split("-"); return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function menujuRamadan() {
    if (!fTgl || !window.KONFIG || !KONFIG.targetRamadhan) return null;
    var t = nomorTgl(KONFIG.targetRamadhan), n = nomorTgl(fTgl.format(new Date())), a = nomorTgl(AWAL_HITUNG);
    var total = Math.max(1, t - a), sisa = t - n;
    return { sisa: sisa, pct: Math.max(0, Math.min(100, Math.round((total - sisa) / total * 100))) };
  }
  function tik() {
    var j = $("jam"); if (j) j.textContent = jamWIB(new Date()) + " WIB";
    var e = $("hitung"), r = sisaHari();
    if (e && r !== null) e.textContent = dua(Math.floor(r / 3600)) + ":" + dua(Math.floor(r % 3600 / 60)) + ":" + dua(r % 60);
    var m = menujuRamadan(), si = $("sisa-isi"), st = $("sisa-teks");
    if (m) {
      if (si) si.style.width = m.pct + "%";
      if (st) st.textContent = m.sisa > 0 ? m.sisa + " HARI \u2022 " + m.pct + "%" : "TELAH TIBA";
    }
  }
  tik(); setInterval(tik, 1000);

  /* ---------- bilah navigasi bawah (tab) ---------- */
  if (nav) {
    var tombol = nav.querySelectorAll("button");
    var ikon = [
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
    ];
    var nama = ["Beranda", "Hitung Mundur"];
    for (var i = 0; i < tombol.length && i < 2; i++) tombol[i].innerHTML = ikon[i] + "<span>" + nama[i] + "</span>";
  }
  function selaras() {
    if (!kv || !nav) return;
    var a = getComputedStyle(kv).getPropertyValue("--a");
    if (a) nav.style.setProperty("--a", a.trim());
  }
  selaras(); setInterval(selaras, 5000);

  /* ---------- live.exe: pemeriksaan server yang NYATA ---------- */
  function ping() {
    return new Promise(function (resolve, reject) {
      var t0 = performance.now(), selesai = false;
      var pewaktu = setTimeout(function () { if (!selesai) { selesai = true; reject(new Error("waktu habis")); } }, 6000);
      function coba(metode) { return fetch("geser.js?ping=" + Date.now(), { method: metode, cache: "no-store" }); }
      coba("HEAD").then(function (r) { return r.ok ? r : coba("GET"); })
        .then(function (r) {
          if (selesai) return;
          selesai = true; clearTimeout(pewaktu);
          if (!r.ok) { reject(new Error("HTTP " + r.status)); return; }
          var d = r.headers.get("date");
          resolve({ ms: Math.round(performance.now() - t0), waktu: d ? new Date(d) : null });
        })
        .catch(function (e) { if (selesai) return; selesai = true; clearTimeout(pewaktu); reject(e); });
    });
  }
  function setLive(ok, ms) {
    document.body.classList.toggle("offline", !ok);
    var l = $("live"), t = $("live-teks");
    if (l) l.className = "live " + (ok ? "on" : "off");
    if (t) t.textContent = ok ? "LIVE " + ms + " ms" : "OFFLINE";
  }
  function denyut() { ping().then(function (r) { setLive(true, r.ms); }).catch(function () { setLive(false); }); }
  setInterval(denyut, 30000);
  window.addEventListener("online", denyut);
  window.addEventListener("offline", function () { setLive(false); });

  /* ---------- layar pembuka ala loading game (sekali tiap kunjungan) ---------- */
  var sudah = false;
  try { sudah = sessionStorage.getItem("boot-sudah") === "1"; sessionStorage.setItem("boot-sudah", "1"); } catch (e) {}
  if (sudah) { denyut(); return; }

  var IK = {
    server: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/></svg>',
    jam: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    kode: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
    buku: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/></svg>',
    kutip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17c0-4 1-7 4-9M14 17c0-4 1-7 4-9"/></svg>',
    gerigi: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/></svg>'
  };
  function barisHTML(kunci, ikon, nama) {
    return '<div class="br" id="br-' + kunci + '"><span class="br-ikon">' + ikon + '</span><span class="br-nama">' + nama + '</span><span class="br-lencana tunggu" id="bl-' + kunci + '">MENUNGGU</span></div>';
  }
  var TIPS = [
    "Ayat dan hadis berganti otomatis tiap pukul 00.00 WIB.",
    "Geser layar ke kiri untuk melihat hitung mundur Ramadan.",
    "Foto masjid di halaman 2 berganti setiap hari.",
    "Warna dan gaya huruf juga berganti tiap hari.",
    "Lencana LIVE memeriksa server tiap 30 detik."
  ];

  var layar = document.createElement("div");
  layar.id = "boot";
  layar.innerHTML =
    '<div class="boot-bungkus">' +
    '<div class="boot-logo-w"><svg class="boot-cincin" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="none" stroke="#3ff0ff" stroke-width="1.4" stroke-dasharray="6 5"/><circle cx="50" cy="50" r="41" fill="none" stroke="#ffc94d" stroke-width="1" stroke-dasharray="2 7"/></svg>' +
    '<svg class="boot-bulan" viewBox="0 0 360 360" aria-hidden="true"><defs><mask id="bulan-boot"><rect width="360" height="360" fill="#fff"/><circle cx="235" cy="150" r="130" fill="#000"/></mask></defs><circle cx="170" cy="190" r="140" fill="#ffc94d" mask="url(#bulan-boot)"/></svg></div>' +
    '<div class="boot-isi">' +
    '<div class="boot-status" id="boot-status">' + IK.gerigi + '<span id="boot-status-teks">SYSTEM STATUS : MEMULAI</span></div>' +
    '<div class="boot-judul"><span class="b1">RAMADHAN</span><span class="b2">SERVER 1448H</span></div>' +
    '<div class="boot-sub" id="boot-sub">Menyiapkan server...</div>' +
    '<div class="boot-daftar">' +
      barisHTML("live", IK.server, "&gt; live.exe") +
      barisHTML("waktu", IK.jam, "waktu server") +
      barisHTML("tema", IK.kode, "&gt; ramadhan.bat") +
      barisHTML("ayat", IK.buku, "ayat harian") +
      barisHTML("hadis", IK.kutip, "hadis harian") +
    '</div>' +
    '<div class="boot-progres"><div class="boot-p-kiri">&gt; loading</div><div class="boot-persen" id="boot-persen">0%</div></div>' +
    '<div class="boot-bar"><div class="boot-isi-bar" id="boot-bar"></div></div>' +
    '<div class="boot-tips" id="boot-tips">TIPS: ' + TIPS[0] + '</div>' +
    '<button type="button" class="boot-tombol" id="boot-tombol">' + IK.wifi + '<span id="boot-tombol-teks">LEWATI</span></button>' +
    '</div></div>';
  document.body.appendChild(layar);

  var tertutup = false;
  function tutup() {
    if (tertutup) return;
    tertutup = true;
    layar.classList.add("pudar");
    setTimeout(function () { if (layar.parentNode) layar.parentNode.removeChild(layar); }, 700);
    selaras();
  }
  var tb = $("boot-tombol");
  if (tb) tb.addEventListener("click", tutup);

  function lencana(kunci, kelas, teks) {
    var e = $("bl-" + kunci);
    if (e) { e.className = "br-lencana " + kelas; e.textContent = teks; }
  }
  function tidur(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* bilah progres: angka naik pelan menuju target nyata (langkah selesai / total) */
  var target = 0, tampil = 0;
  function gambarProgres() {
    if (tertutup) return;
    tampil += Math.max(0.12, (target - tampil) * 0.045);
    if (tampil > target) tampil = target;
    var p = Math.round(tampil), b = $("boot-bar"), t = $("boot-persen");
    if (b) b.style.width = tampil + "%";
    if (t) t.textContent = p + "%";
    requestAnimationFrame(gambarProgres);
  }
  requestAnimationFrame(gambarProgres);

  var tipsNo = 0;
  var tipsId = setInterval(function () {
    if (tertutup) { clearInterval(tipsId); return; }
    tipsNo = (tipsNo + 1) % TIPS.length;
    var e = $("boot-tips");
    if (e) { e.className = "boot-tips ganti"; setTimeout(function () { e.textContent = "TIPS: " + TIPS[tipsNo]; e.className = "boot-tips"; }, 250); }
  }, 2600);

  function dariDOM(kunci) {
    if (kunci === "ayat") {
      var a = $("arab"), l = $("label");
      var ada = a && a.textContent && a.textContent.indexOf("memuat") < 0;
      return ada && l && l.textContent.indexOf("CADANGAN") < 0 ? "cache" : "gagal";
    }
    var h = $("hteks");
    var adah = h && h.textContent && h.textContent.indexOf("memuat") < 0 && h.textContent.indexOf("belum bisa") < 0;
    return adah ? "cache" : "gagal";
  }
  function tunggu(kunci, batas) {
    return new Promise(function (resolve) {
      function cek() {
        if (STATUS[kunci]) { resolve(STATUS[kunci]); return true; }
        if (Date.now() >= batas) { resolve(dariDOM(kunci)); return true; }
        return false;
      }
      if (cek()) return;
      var id = setInterval(function () { if (cek()) clearInterval(id); }, 150);
    });
  }

  var total = 5, selesaiN = 0, serverOk = false, semuaOk = true, hasilPing = null, sudahSelesai = false;
  var mulai = Date.now(), batasMuat = mulai + 15000;

  /* satu langkah: tandai aktif, jalankan pemeriksaan nyata, tahan minimal JEDA_LANGKAH */
  function langkah(kunci, subteks, kerja) {
    var baris = $("br-" + kunci), sub = $("boot-sub");
    if (baris) baris.className = "br aktif";
    if (sub) sub.textContent = subteks;
    lencana(kunci, "jalan", "MEMERIKSA");
    var t0 = Date.now();
    return Promise.resolve().then(kerja).then(function (h) {
      return tidur(Math.max(0, JEDA_LANGKAH - (Date.now() - t0))).then(function () { return h; });
    }).then(function (h) {
      lencana(kunci, h.kelas, h.teks);
      if (baris) baris.className = "br";
      selesaiN++;
      target = selesaiN / total * 100;
    });
  }

  function selesai() {
    if (sudahSelesai) return;
    sudahSelesai = true;
    var sub = $("boot-sub"), st = $("boot-status"), stt = $("boot-status-teks"), tt = $("boot-tombol-teks");
    if (sub) sub.textContent = serverOk && semuaOk ? "Server siap. Semua modul berjalan normal."
      : (serverOk ? "Server aktif. Sebagian modul memakai data tersimpan." : "Tidak ada koneksi. Memakai data tersimpan.");
    if (stt) stt.textContent = "SYSTEM STATUS : " + (serverOk ? "LIVE" : "OFFLINE");
    if (st) st.className = "boot-status" + (serverOk ? "" : " off");
    if (tb) tb.className = "boot-tombol" + (serverOk ? " siap" : " off");
    if (tt) tt.textContent = serverOk ? "STAY CONNECTED" : "OFFLINE MODE";
    target = 100;
    setTimeout(tutup, JEDA_TUTUP);
  }

  tidur(JEDA_AWAL)
    .then(function () {
      return langkah("live", "Menghubungi server...", function () {
        return ping().then(function (r) {
          serverOk = true; hasilPing = r; setLive(true, r.ms);
          return { kelas: "ok", teks: "LIVE " + r.ms + " ms" };
        }).catch(function () {
          semuaOk = false; setLive(false);
          return { kelas: "gagal", teks: "OFFLINE" };
        });
      });
    })
    .then(function () {
      return langkah("waktu", "Menyinkronkan waktu server...", function () {
        if (hasilPing && hasilPing.waktu) return { kelas: "info", teks: jamWIB(hasilPing.waktu) + " WIB" };
        semuaOk = false; return { kelas: "gagal", teks: "TIDAK ADA" };
      });
    })
    .then(function () {
      return langkah("tema", "Memasang tema dan font hari ini...", function () {
        var tema = kv ? kv.getAttribute("data-tema") : null;
        if (tema) return { kelas: "info", teks: "TEMA " + tema.replace(/^t/, "") };
        semuaOk = false; return { kelas: "gagal", teks: "BELUM" };
      });
    })
    .then(function () {
      return langkah("ayat", "Memuat ayat harian...", function () {
        return tunggu("ayat", batasMuat).then(function (v) {
          if (v === "ok") return { kelas: "ok", teks: "OK" };
          semuaOk = false;
          return v === "cache" ? { kelas: "tanda", teks: "SIMPANAN" } : { kelas: "gagal", teks: "GAGAL" };
        });
      });
    })
    .then(function () {
      return langkah("hadis", "Memuat hadis harian...", function () {
        return tunggu("hadis", batasMuat).then(function (v) {
          if (v === "ok") return { kelas: "ok", teks: "OK" };
          semuaOk = false;
          return v === "cache" ? { kelas: "tanda", teks: "SIMPANAN" } : { kelas: "gagal", teks: "GAGAL" };
        });
      });
    })
    .then(selesai);

  setTimeout(selesai, 30000);   // pengaman
  setTimeout(tutup, 36000);     // pengaman: tidak pernah menahan halaman lebih dari 36 detik
})();
