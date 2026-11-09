(function () {
  var STATUS = window.STATUS = { ayat: null, hadis: null };
  window.kabar = function (kunci, nilai) {
    STATUS[kunci] = nilai;
    try { document.dispatchEvent(new CustomEvent("ramadhan-status")); } catch (e) {}
  };

  function $(id) { return document.getElementById(id); }
  var kv = document.querySelector(".kanvas");
  var nav = document.querySelector(".titik");

  /* ---------- jam WIB dan hitung mundur ke pergantian konten (00.00 WIB) ---------- */
  var fJam = null, fBagian = null;
  try {
    fJam = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    fBagian = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
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
  function tik() {
    var j = $("jam"); if (j) j.textContent = jamWIB(new Date()) + " WIB";
    var e = $("hitung"), r = sisaHari();
    if (e && r !== null) e.textContent = dua(Math.floor(r / 3600)) + ":" + dua(Math.floor(r % 3600 / 60)) + ":" + dua(r % 60);
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

  /* ---------- layar pembuka bergaya aplikasi (sekali tiap kunjungan) ---------- */
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
  function barisHTML(id, ikon, nama) {
    return '<div class="br"><span class="br-ikon">' + ikon + '</span><span class="br-nama">' + nama + '</span><span class="br-lencana tunggu" id="' + id + '">...</span></div>';
  }

  var layar = document.createElement("div");
  layar.id = "boot";
  layar.innerHTML =
    '<div class="boot-bungkus">' +
    '<svg class="boot-bulan" viewBox="0 0 360 360" aria-hidden="true"><defs><mask id="bulan-boot"><rect width="360" height="360" fill="#fff"/><circle cx="235" cy="150" r="130" fill="#000"/></mask></defs><circle cx="170" cy="190" r="140" fill="#ffc94d" mask="url(#bulan-boot)"/></svg>' +
    '<div class="boot-isi">' +
    '<div class="boot-status" id="boot-status">' + IK.gerigi + '<span id="boot-status-teks">SYSTEM STATUS : MEMERIKSA</span></div>' +
    '<div class="boot-judul"><span class="b1">RAMADHAN</span><span class="b2">SERVER 1448H</span></div>' +
    '<div class="boot-sub" id="boot-sub">Memeriksa server dan memuat konten harian...</div>' +
    '<div class="boot-daftar">' +
      barisHTML("bl-live", IK.server, "&gt; live.exe") +
      barisHTML("bl-waktu", IK.jam, "waktu server") +
      barisHTML("bl-tema", IK.kode, "&gt; ramadhan.bat") +
      barisHTML("bl-ayat", IK.buku, "ayat harian") +
      barisHTML("bl-hadis", IK.kutip, "hadis harian") +
    '</div>' +
    '<div class="boot-progres"><div class="boot-p-kiri">&gt; loading</div><div class="boot-persen" id="boot-persen">0%</div></div>' +
    '<div class="boot-bar"><div class="boot-isi-bar" id="boot-bar"></div></div>' +
    '<button type="button" class="boot-tombol" id="boot-tombol">' + IK.wifi + '<span id="boot-tombol-teks">LEWATI</span></button>' +
    '</div></div>';
  document.body.appendChild(layar);

  var tertutup = false;
  function tutup() {
    if (tertutup) return;
    tertutup = true;
    layar.classList.add("pudar");
    setTimeout(function () { if (layar.parentNode) layar.parentNode.removeChild(layar); }, 600);
    selaras();
  }
  var tb = $("boot-tombol");
  if (tb) tb.addEventListener("click", tutup);

  function lencana(id, kelas, teks) {
    var e = $(id);
    if (e) { e.className = "br-lencana " + kelas; e.textContent = teks; }
  }
  function progres(p) {
    var b = $("boot-bar"), t = $("boot-persen");
    p = Math.max(0, Math.min(100, Math.round(p)));
    if (b) b.style.width = p + "%";
    if (t) t.textContent = p + "%";
  }

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

  var total = 4, selesaiN = 0, serverOk = false, semuaOk = true, sudahSelesai = false;
  var mulai = Date.now();

  function selesai() {
    if (sudahSelesai) return;
    sudahSelesai = true;
    var sub = $("boot-sub"), st = $("boot-status"), stt = $("boot-status-teks"), tt = $("boot-tombol-teks");
    if (sub) sub.textContent = serverOk && semuaOk ? "Server siap. Semua modul berjalan normal."
      : (serverOk ? "Server aktif. Sebagian modul memakai data tersimpan." : "Tidak ada koneksi. Memakai data tersimpan.");
    if (stt) stt.textContent = "SYSTEM STATUS : " + (serverOk ? "LIVE" : "OFFLINE");
    if (st) st.className = "boot-status" + (serverOk ? "" : " off");
    if (tb) tb.className = "boot-tombol" + (serverOk ? "" : " off");
    if (tt) tt.textContent = serverOk ? "STAY CONNECTED" : "OFFLINE MODE";
    progres(100);
    setTimeout(tutup, 2600);
  }
  function maju() { selesaiN++; progres(selesaiN / total * 100); if (selesaiN >= total) selesai(); }

  // live.exe
  ping().then(function (r) {
    serverOk = true;
    lencana("bl-live", "ok", "LIVE " + r.ms + " ms");
    lencana("bl-waktu", "info", r.waktu ? jamWIB(r.waktu) + " WIB" : "-");
    setLive(true, r.ms);
  }).catch(function () {
    semuaOk = false;
    lencana("bl-live", "gagal", "OFFLINE");
    lencana("bl-waktu", "gagal", "-");
    setLive(false);
  }).then(maju);

  // ramadhan.bat
  var tema = kv ? kv.getAttribute("data-tema") : null;
  if (tema) lencana("bl-tema", "info", "TEMA " + tema.replace(/^t/, ""));
  else { semuaOk = false; lencana("bl-tema", "gagal", "BELUM"); }
  maju();

  var batas = mulai + 12000;
  [["ayat", "bl-ayat"], ["hadis", "bl-hadis"]].forEach(function (p) {
    tunggu(p[0], batas).then(function (v) {
      if (v === "ok") lencana(p[1], "ok", "OK");
      else if (v === "cache") { semuaOk = false; lencana(p[1], "tanda", "SIMPANAN"); }
      else { semuaOk = false; lencana(p[1], "gagal", "GAGAL"); }
      maju();
    });
  });

  setTimeout(function () { selesai(); }, 20000);   // pengaman: tidak pernah menahan halaman lebih dari 20 detik
  setTimeout(tutup, 23000);
})();
