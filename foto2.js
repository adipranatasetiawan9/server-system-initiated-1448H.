(function () {
  var h2 = document.querySelector("#h2 .kanvas-2");
  if (!h2 || !window.MASJID || !window.MASJID.length) return;

  // Foto yang dilewati (terlalu buram). Hapus namanya kalau sudah diganti.
  var LEWATI = ["m11.jpg"];
  var ATUR = window.ATUR_FOTO || {};   // {"m05.png": 0.78}  (diisi dari foto-atur.js)

  var daftar = window.MASJID.filter(function (f) {
    return !LEWATI.some(function (x) { return f.indexOf(x) !== -1; });
  });
  if (!daftar.length) return;

  var fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KONFIG.zona, year: "numeric", month: "2-digit", day: "2-digit"
  });
  function nomor(k) {
    var p = k.split("-");
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
  }
  function param(n) {
    try { var v = parseFloat(new URLSearchParams(location.search).get(n)); return isNaN(v) ? null : v; }
    catch (e) { return null; }
  }
  function pilih() {
    var q = param("masjid");
    if (q >= 1 && q <= window.MASJID.length) return window.MASJID[q - 1];   // uji: ?masjid=5
    return daftar[nomor(fmt.format(new Date())) % daftar.length];
  }

  var cat = h2.querySelector(".p2-catatan");
  if (cat) cat.parentNode.removeChild(cat);

  var f = document.createElement("div"); f.className = "p2-foto";
  var ea = document.createElement("div"); ea.className = "ext ext-a";
  var eb = document.createElement("div"); eb.className = "ext ext-b";
  var im = document.createElement("img"); im.className = "utama"; im.alt = "";
  f.appendChild(ea); f.appendChild(eb); f.appendChild(im);
  h2.insertBefore(f, h2.firstChild);

  var dipakai = "", nama = "", base = 0.8;

  // Perkiraan letak "dasar" masjid: baris terendah yang masih memperlihatkan langit biru
  function deteksi() {
    try {
      var w = 60, h = Math.max(20, Math.round(60 * im.naturalHeight / im.naturalWidth));
      var c = document.createElement("canvas"); c.width = w; c.height = h;
      var x = c.getContext("2d"); x.drawImage(im, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, y, i, p, n, r;
      var minRun = Math.max(3, Math.round(h * 0.08)), run = 0, gap = 0, akhir = -1;
      // Hanya langit yang tersambung dari atas yang dihitung (laut/kolam biru di bawah diabaikan)
      for (y = 0; y < h; y++) {
        n = 0;
        for (i = 0; i < w; i++) {
          p = (y * w + i) * 4;
          if (d[p + 2] >= 110 && d[p + 2] > d[p] + 18 && d[p + 2] >= d[p + 1] - 5) n++;
        }
        r = n / w;
        if (r > 0.12) { run++; gap = 0; akhir = y; }
        else if (run > 0) {
          gap++;
          if (gap > 2) { if (run >= minRun) break; run = 0; gap = 0; akhir = -1; }
        }
      }
      if (run < minRun || akhir < 0) return 0.8;
      return Math.max(0.4, Math.min(0.9, (akhir + 1) / h + 0.14));
    } catch (e) { return 0.8; }
  }

  function susun() {
    var Wc = h2.clientWidth, Hc = h2.clientHeight;
    if (!im.naturalWidth || !Wc) return;
    var Hd = Wc * im.naturalHeight / im.naturalWidth;
    var hadis = h2.querySelector(".p2-hadis");
    var tgt = (hadis ? hadis.offsetTop / Hc : 0.589) - 0.012;   // tepat di atas kotak hadis
    var top = tgt * Hc - base * Hd;
    im.style.width = Wc + "px"; im.style.height = Hd + "px";
    im.style.left = "0"; im.style.top = top + "px";
    var bawah = top + Hd;
    ea.style.display = top > 1 ? "block" : "none";
    ea.style.height = (Math.max(top, 0) + 8) + "px";
    eb.style.display = bawah < Hc - 1 ? "block" : "none";
    eb.style.top = (bawah - 8) + "px";
    eb.style.height = (Hc - bawah + 8) + "px";
    var t = document.getElementById("aturteks");
    if (t) t.textContent = '"' + nama + '": ' + base.toFixed(2) + ",";
    var g = document.getElementById("aturgeser");
    if (g) g.value = base;
  }

  im.onload = function () {
    var a = param("alas");
    base = (a !== null) ? a : (ATUR[nama] !== undefined ? ATUR[nama] : deteksi());
    susun();
    f.classList.add("tampil");
  };

  function pasang() {
    var u = pilih();
    if (u === dipakai) return;
    dipakai = u;
    nama = u.split("/").pop();
    var enc = encodeURI(u);
    ea.style.backgroundImage = eb.style.backgroundImage = 'url("' + enc + '")';
    im.src = enc;
  }

  if (/[?&]atur=1/.test(location.search)) {
    var pn = document.createElement("div"); pn.className = "atur";
    pn.innerHTML = '<div id="aturteks"></div><input id="aturgeser" type="range" min="0.5" max="0.95" step="0.01">';
    h2.appendChild(pn);
    pn.querySelector("input").addEventListener("input", function (e) {
      base = parseFloat(e.target.value); susun();
    });
  }

  window.addEventListener("resize", susun);
  pasang();
  setInterval(pasang, 30000);   // berganti sendiri lewat 00.00 WIB
})();
