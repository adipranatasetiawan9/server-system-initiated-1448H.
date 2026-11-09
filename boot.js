(function () {
  var STATUS = window.STATUS = { ayat: null, hadis: null };
  window.kabar = function (kunci, nilai) {
    STATUS[kunci] = nilai;
    try { document.dispatchEvent(new CustomEvent("ramadhan-status")); } catch (e) {}
  };

  function $(id) { return document.getElementById(id); }
  var kv = document.querySelector(".kanvas");
  var nav = document.querySelector(".titik");

  /* ---------- jam WIB (jam perangkat, zona Asia/Jakarta) ---------- */
  var fJam = null;
  try {
    fJam = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  } catch (e) {}
  function jamWIB(d) { return fJam ? fJam.format(d).replace(/:/g, ".") : "--.--.--"; }
  function tik() { var j = $("jam"); if (j) j.textContent = jamWIB(new Date()) + " WIB"; }
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

  /* ---------- layar pembuka (sekali tiap kunjungan) ---------- */
  var sudah = false;
  try { sudah = sessionStorage.getItem("boot-sudah") === "1"; sessionStorage.setItem("boot-sudah", "1"); } catch (e) {}
  if (sudah) { denyut(); return; }

  var layar = document.createElement("div");
  layar.id = "boot";
  layar.innerHTML =
    '<div class="boot-isi">' +
    '<svg class="boot-logo" viewBox="0 0 360 360" aria-hidden="true"><defs><mask id="bulan-boot"><rect width="360" height="360" fill="#fff"/><circle cx="235" cy="150" r="130" fill="#000"/></mask></defs><circle cx="170" cy="190" r="140" fill="#3ff0ff" mask="url(#bulan-boot)"/></svg>' +
    '<div class="boot-judul">RAMADHAN 1448H</div>' +
    '<div class="boot-log" id="boot-log"></div>' +
    '<div class="boot-bar"><div class="boot-isi-bar" id="boot-bar"></div></div>' +
    '<div class="boot-info"><span id="boot-label">loading</span><span id="boot-persen">0%</span></div>' +
    '<div class="boot-lewati">ketuk untuk melewati</div></div>';
  document.body.appendChild(layar);

  var tertutup = false;
  function tutup() {
    if (tertutup) return;
    tertutup = true;
    layar.classList.add("pudar");
    setTimeout(function () { if (layar.parentNode) layar.parentNode.removeChild(layar); }, 600);
    selaras();
  }
  layar.addEventListener("click", tutup);

  function baris(teks, kelas) {
    var e = document.createElement("div");
    e.className = kelas || "";
    e.textContent = teks;
    var log = $("boot-log");
    if (log) log.appendChild(e);
    return e;
  }
  function tandai(e, kelas, label, teks) { e.className = kelas; e.textContent = "  [ " + label + " ] " + teks; }
  function ketik(teks) {
    return new Promise(function (resolve) {
      var e = baris("", "cmd"), n = 0;
      var id = setInterval(function () {
        n++; e.textContent = teks.slice(0, n);
        if (n >= teks.length) { clearInterval(id); setTimeout(resolve, 120); }
      }, 28);
    });
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

  var total = 4, selesaiN = 0, serverOk = false, semuaOk = true;
  function maju() { selesaiN++; progres(selesaiN / total * 100); }
  var mulai = Date.now();

  ketik("> live.exe").then(function () {
    var b = baris("  memeriksa server...", "tunggu");
    return ping().then(function (r) {
      serverOk = true;
      tandai(b, "ok", "OK", "server aktif \u2022 " + r.ms + " ms");
      if (r.waktu) baris("  [ OK ] waktu server " + jamWIB(r.waktu) + " WIB", "ok");
      setLive(true, r.ms);
    }).catch(function () {
      semuaOk = false;
      tandai(b, "gagal", "GAGAL", "server tidak merespons");
      setLive(false);
    }).then(maju);
  }).then(function () {
    return ketik("> ramadhan.bat");
  }).then(function () {
    var bt = baris("  tema harian...", "tunggu");
    var ba = baris("  ayat harian...", "tunggu");
    var bh = baris("  hadis harian...", "tunggu");

    var tema = kv ? kv.getAttribute("data-tema") : null;
    var fontH = kv ? kv.style.getPropertyValue("--fh") : "";
    if (tema) {
      tandai(bt, "ok", "OK", "tema " + tema.replace(/^t/, "") + " \u2022 font " + String(fontH).replace(/["']/g, ""));
    } else { semuaOk = false; tandai(bt, "gagal", "GAGAL", "tema belum terpasang"); }
    maju();

    var batas = mulai + 12000;
    var pa = tunggu("ayat", batas).then(function (v) {
      var r = $("ref") ? $("ref").textContent : "";
      if (v === "ok") tandai(ba, "ok", "OK", "ayat harian \u2022 " + r);
      else if (v === "cache") { semuaOk = false; tandai(ba, "tanda", "!", "ayat dari simpanan \u2022 " + r); }
      else { semuaOk = false; tandai(ba, "gagal", "GAGAL", "ayat cadangan dipakai"); }
      maju();
    });
    var ph = tunggu("hadis", batas).then(function (v) {
      var r = $("hhref") ? $("hhref").textContent : "";
      if (v === "ok") tandai(bh, "ok", "OK", "hadis harian \u2022 " + r);
      else if (v === "cache") { semuaOk = false; tandai(bh, "tanda", "!", "hadis dari simpanan \u2022 " + r); }
      else { semuaOk = false; tandai(bh, "gagal", "GAGAL", "hadis belum termuat"); }
      maju();
    });
    return Promise.all([pa, ph]);
  }).then(function () {
    return ketik("> loading");
  }).then(function () {
    var teks, kelas;
    if (serverOk && semuaOk) { teks = "  SERVER LIVE \u2022 semua modul siap"; kelas = "ok"; }
    else if (serverOk) { teks = "  SERVER LIVE \u2022 sebagian modul memakai simpanan"; kelas = "tanda"; }
    else { teks = "  OFFLINE \u2022 memakai data tersimpan"; kelas = "gagal"; }
    baris(teks, kelas);
    var l = $("boot-label"); if (l) l.textContent = "selesai";
    progres(100);
    setTimeout(tutup, 900);
  });

  setTimeout(tutup, 20000);   // pengaman: tidak pernah menahan halaman lebih dari 20 detik
})();
