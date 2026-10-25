window.KONFIG = {
  zona: "Asia/Jakarta",
  targetRamadhan: "2027-02-08",
  kecualikan: ["2:183", "2:184", "2:185", "97:1", "97:2", "97:3"]
};

var DAFTAR_AYAT = [
  "2:186", "44:3", "17:9", "10:57", "39:10",
  "3:134", "49:13", "21:107", "76:8", "2:153"
];

var CADANGAN = {
  ref: "21:107",
  arab: "وَمَآ أَرْسَلْنَٰكَ إِلَّا رَحْمَةً لِّلْعَٰلَمِينَ",
  arti: "Dan Kami tidak mengutus engkau (Muhammad), melainkan sebagai rahmat bagi seluruh alam.",
  surah: "Al-Anbiya'", nomor: 107, juz: 17
};

var DAFTAR_HADIS = [
  { k: "bukhari",  n: 3277 }, { k: "bukhari",  n: 38 },
  { k: "bukhari",  n: 1898 }, { k: "bukhari",  n: 1901 },
  { k: "bukhari",  n: 2014 }, { k: "muslim",   n: 1781 },
  { k: "muslim",   n: 2495 }, { k: "muslim",   n: 2496 },
  { k: "abudawud", n: 1381 }, { k: "abudawud", n: 1610 },
    { k: "ibnmajah", n: 1641 }
];

if (window.HADIS_PENDEK && window.HADIS_PENDEK.length) DAFTAR_HADIS = window.HADIS_PENDEK;

var NAMA_SURAH = [null,
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Taha",
  "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum",
  "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Yasin", "As-Saffat", "Sad", "Az-Zumar", "Gafir",
  "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadalah", "Al-Hasyr", "Al-Mumtahanah",
  "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr", "Al-Balad",
  "Asy-Syams", "Al-Lail", "Ad-Duha", "Al-Insyirah", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat",
  "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr",
  "Al-Lahab", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

var NAMA_KITAB = {
  bukhari: "Bukhari", muslim: "Muslim", abudawud: "Abu Dawud",
  tirmidhi: "At-Tirmidzi", ibnmajah: "Ibnu Majah", nasai: "An-Nasa'i"
};

(function () {
  function $(id) { return document.getElementById(id); }

  var fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KONFIG.zona, year: "numeric", month: "2-digit", day: "2-digit"
  });
  function kunciHariIni() { return fmt.format(new Date()); }
  function nomorHari(k) {
    var p = k.split("-");
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
  }
  function simpan(kunci, data) {
    try { localStorage.setItem(kunci, JSON.stringify(data)); } catch (e) {}
  }
  function baca(kunci) {
    try { var s = localStorage.getItem(kunci); return s ? JSON.parse(s) : null; }
    catch (e) { return null; }
  }

  // ---------- AYAT ----------
  function pilihRef(k) {
    var d = DAFTAR_AYAT.filter(function (r) { return KONFIG.kecualikan.indexOf(r) === -1; });
    return d[nomorHari(k) % d.length];
  }
  function ambilAyat(ref) {
    var url = "https://api.alquran.cloud/v1/ayah/" + ref + "/editions/quran-uthmani,id.indonesian";
    return fetch(url)
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        var ar = null, id = null;
        (j.data || []).forEach(function (d) {
          if (d.edition.identifier === "quran-uthmani") ar = d;
          if (d.edition.identifier === "id.indonesian") id = d;
        });
        if (!ar || !id) throw new Error("Data tidak lengkap");
        return { ref: ref, arab: ar.text, arti: id.text,
                 surah: ar.surah.englishName, nomor: ar.numberInSurah, juz: ar.juz };
      });
  }

  // ---------- HADIS ----------
  var BASE_HADIS = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/";
  function ambilJson(edisi, nomor) {
    return fetch(BASE_HADIS + edisi + "/" + nomor + ".json")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) {
        var h = j.hadiths && j.hadiths[0];
        if (!h) throw new Error("Hadis kosong");
        return h;
      });
  }
  function matn(t) {
    t = String(t).replace(/\s+/g, " ").trim();
    var i = t.search(/["\u201C]/);
    if (i >= 0) {
      t = t.slice(i + 1);
      var k = t.search(/["\u201D]/);
      if (k >= 0) t = t.slice(0, k);   // berhenti di tanda kutip penutup (buang catatan perawi)
    } else if (/^telah (menceritakan|mengabarkan|bercerita|memberitakan)/i.test(t) && t.lastIndexOf("]") >= 0) {
      t = t.slice(t.lastIndexOf("]") + 1);
      t = t.replace(/^[\s,;:.]*((ia|dia|beliau)\s+)?(berkata|mengatakan|menceritakan|bercerita)?[\s,;:]*(bahwa\s+)?/i, "");
    } else {
      var j = t.search(/bersabda\s*:?/i);
      if (j >= 0) t = t.slice(j).replace(/^bersabda\s*:?\s*/i, "");
    }
    t = t.replace(/^["\u201C]\s*/, "").replace(/\s*["\u201D]?\s*$/, "");
    if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
    if (!/[.!?]$/.test(t)) t += ".";
    return t;
  }
  function lolos(grades) {
    var g = grades.map(function (x) { return String(x.grade || "").toLowerCase(); });
    var adaSahih = g.some(function (x) { return x.indexOf("sahih") === 0; });
    var adaLemah = g.some(function (x) { return /da.?if|weak|fabricated|maudu|munkar/.test(x); });
    return adaSahih && !adaLemah;
  }
  function ringkas(grades) {
    var peta = {}, urut = [];
    grades.forEach(function (g) {
      var s = String(g.grade || ""), n = /sahih/i.test(s) ? "Shahih" : (/hasan/i.test(s) ? "Hasan" : "");
      if (!n) return;
      if (!peta[n]) { peta[n] = []; urut.push(n); }
      if (peta[n].indexOf(g.name) < 0) peta[n].push(g.name);
    });
    return urut.map(function (n) { return n + " (" + peta[n].slice(0, 3).join(", ") + ")"; }).join(" \u2022 ");
  }
  // Perbaiki ejaan lama dari terjemahan sumber (Ramadlan -> Ramadhan, dst.)
  function bakuin(t) {
    return String(t)
      .replace(/Ramadl/g, "Ramadh").replace(/ramadl/g, "ramadh")
      .replace(/Radliallahu/g, "Radhiyallahu").replace(/radliallahu/g, "radhiyallahu")
      .replace(/shallAllahu/g, "shallallahu")
      .replace(/Ridla/g, "Ridha").replace(/ridla/g, "ridha")
      .replace(/Fardlu/g, "Fardhu").replace(/fardlu/g, "fardhu")
      .replace(/Adlha/g, "Adha").replace(/adlha/g, "adha")
      .replace(/[Ss]y(a|e)i?tan/g, function (m) { return m.charAt(0) === "S" ? "Setan" : "setan"; })
      .replace(/\s+([,.;:!?])/g, "$1");
  }
  var MAKS_HURUF = 200;   // hadis lebih panjang dari ini dilewati (tidak terbaca di layar HP)
  function ambilHadis(item) {
    var kitabSahih = (item.k === "bukhari" || item.k === "muslim");
    var pInd = ambilJson("ind-" + item.k, item.n);
    var pEng = kitabSahih ? Promise.resolve(null) : ambilJson("eng-" + item.k, item.n);
    return Promise.all([pInd, pEng]).then(function (r) {
      var ind = r[0], eng = r[1];
      var grades = eng ? (eng.grades || []) : [];
      if (eng && !lolos(grades)) { var e = new Error("Derajat tidak lolos"); e.tolak = true; throw e; }
      var teks = bakuin(matn(ind.text));
      if (/^telah (menceritakan|mengabarkan|bercerita|memberitakan)/i.test(teks) ||
          /\[[^\]]+\]/.test(teks) || teks.length > MAKS_HURUF || teks.length < 40) {
        var e2 = new Error("Hadis tidak cocok ditampilkan"); e2.tolak = true; throw e2;
      }
      return { k: item.k, n: item.n, perawi: NAMA_KITAB[item.k] || item.k,
               teks: teks,
               derajat: eng ? ringkas(grades) : "Shahih (termuat dalam kitab Shahih)" };
    });
  }
  function pilihHadis(k) {
    var mulai = nomorHari(k) % DAFTAR_HADIS.length, i = 0;
    function coba() {
      if (i >= DAFTAR_HADIS.length) return Promise.reject(new Error("Tidak ada hadis yang lolos"));
      var item = DAFTAR_HADIS[(mulai + i) % DAFTAR_HADIS.length];
      return ambilHadis(item).catch(function () { i++; return coba(); });
    }
    return coba();
  }

  // ---------- TAMPILAN ----------
  // Kecilkan huruf sampai isi muat di dalam kotak (elemen terakhir = acuan batas minimum)
  function kecilkan(kotak, els) {
    var f = els.map(function (e) { e.style.fontSize = ""; return parseFloat(getComputedStyle(e).fontSize); });
    var n = 0;
    while (kotak.scrollHeight > kotak.clientHeight && f[f.length - 1] > 6.5 && n < 40) {
      f = f.map(function (x) { return x * 0.95; });
      els.forEach(function (e, i) { e.style.fontSize = f[i] + "px"; });
      n++;
    }
  }
  window.fitAyat2 = function () { kecilkan($("ayat"), [$("arab"), $("arti")]); };
  window.fitHadis = function () { kecilkan($("hadis"), [$("hderajat"), $("hteks")]); };

  function rapikan(t) {
    return String(t).replace(/([.!?])\s+([a-z])/g, function (m, a, b) { return a + " " + b.toUpperCase(); });
  }
  function tampilAyat(d, label) {
    $("label").textContent = label;
    $("ref").textContent = "QS. " + (NAMA_SURAH[parseInt(d.ref, 10)] || d.surah) + " \u2022 " + d.ref + " \u2022 Juz " + d.juz;
    $("arab").textContent = d.arab;
    $("arti").textContent = "\u201C" + rapikan(d.arti) + "\u201D";
    window.fitAyat2();
  }
  function tampilHadis(h) {
    $("hhref").textContent = "HR. " + h.perawi + " \u2022 No. " + h.n;
    $("hteks").textContent = "\u201C" + h.teks + "\u201D";
    $("hderajat").textContent = "Derajat: " + h.derajat;
    window.fitHadis();
  }

  // ---------- PEMBARUAN HARIAN (00.00 WIB) ----------
  var kunciTampil = null, ulang = false;
  function perbarui() {
    var k = kunciHariIni();
    if (k === kunciTampil && !ulang) return;
    kunciTampil = k; ulang = false;

    var ref = pilihRef(k), kA = "ayat:" + ref, tA = baca(kA);
    if (tA) tampilAyat(tA, "[ AYAT HARI INI ]");
    ambilAyat(ref)
      .then(function (d) { simpan(kA, d); if (kunciTampil === k) tampilAyat(d, "[ AYAT HARI INI ]"); })
      .catch(function () {
        if (!tA) { tampilAyat(CADANGAN, "[ AYAT CADANGAN ]"); ulang = true; }
      });

    var kH = "hadis5:" + k, tH = baca(kH);
    if (tH) tampilHadis(tH);
    pilihHadis(k)
      .then(function (h) { simpan(kH, h); if (kunciTampil === k) tampilHadis(h); })
      .catch(function () {
        if (!tH) { $("hteks").textContent = "Hadis belum bisa dimuat. Periksa internet."; ulang = true; }
      });
  }
  perbarui();
  setInterval(perbarui, 30000);
})();

// ===== Tahap 15: 31 tema warna + 31 gaya font, berganti tiap hari (WIB) =====
(function () {
  // [warna utama, warna rujukan HR./QS.]
  var TEMA = [
    ["#00e5ff","#ffd166"],["#ffc107","#ffffff"],["#2ee6a6","#ffd166"],["#4da3ff","#ffd166"],["#b388ff","#ffd166"],
    ["#ff5caa","#ffe08a"],["#ff9f1a","#ffffff"],["#ff6b5e","#ffe08a"],["#7cff6b","#ffd166"],["#26c6da","#ffd166"],
    ["#c6f135","#ffffff"],["#ff8a65","#ffe08a"],["#40c4ff","#ffd166"],["#e040fb","#ffe08a"],["#ffea00","#ffffff"],
    ["#69f0ae","#ffd166"],["#ff5252","#ffe08a"],["#18ffff","#ffd166"],["#1de9b6","#ffe08a"],["#ffab40","#ffffff"],
    ["#7c8cff","#ffd166"],["#ff4081","#ffe08a"],["#ffd740","#ffffff"],["#00e676","#ffe08a"],["#29b6f6","#ffd166"],
    ["#d65dff","#ffe08a"],["#ff9100","#ffffff"],["#64ffda","#ffd166"],["#ff6ea1","#ffe08a"],["#f4d03f","#ffffff"],
    ["#ff6f91","#ffd166"]
  ];

  // [font judul, font isi]
  var FONT = [
    ["Orbitron","Rubik"],["Cinzel","Lato"],["Chakra Petch","Inter"],["Playfair Display","Open Sans"],
    ["Poppins","Roboto"],["Montserrat","Noto Sans"],["Sora","IBM Plex Sans"],["Space Grotesk","DM Sans"],
    ["Exo 2","Fira Sans"],["Oxanium","Public Sans"],["Merriweather","PT Sans"],["Lora","Ubuntu"],
    ["Kanit","Cabin"],["Outfit","Karla"],["Plus Jakarta Sans","Mulish"],["Lexend","Hind"],
    ["Rubik","Open Sans"],["Barlow","Roboto"],["Work Sans","Lato"],["Saira","Inter"],
    ["Titillium Web","DM Sans"],["DM Serif Display","Manrope"],["Abril Fatface","Public Sans"],["Alfa Slab One","Fira Sans"],
    ["Russo One","Noto Sans"],["Righteous","Hind"],["Audiowide","IBM Plex Sans"],["Bitter","Ubuntu"],
    ["Libre Baskerville","Karla"],["Manrope","PT Sans"],["Raleway","Lato"]
  ];

  var fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KONFIG.zona, year: "numeric", month: "2-digit", day: "2-digit"
  });
  function nomorHari(k) {
    var p = k.split("-");
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
  }
  function qs(n) {
    try {
      var v = parseInt(new URLSearchParams(location.search).get(n), 10);
      return (v >= 1 && v <= 31) ? v : null;
    } catch (e) { return null; }
  }

  function rgb(h) {
    h = h.replace("#", "");
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgba(h, a, k) {
    var c = rgb(h); k = k || 1;
    return "rgba(" + Math.round(c[0] * k) + "," + Math.round(c[1] * k) + "," + Math.round(c[2] * k) + "," + a + ")";
  }
  function campur(h, p) {
    var c = rgb(h);
    return "rgb(" + c.map(function (v) { return Math.round(v + (255 - v) * p); }).join(",") + ")";
  }

  function fit(el) {
    el.style.fontSize = "";
    var f = parseFloat(getComputedStyle(el).fontSize), n = 0;
    while (el.scrollWidth > el.clientWidth + 1 && n < 40) {
      f *= 0.96;
      el.style.fontSize = f + "px";
      n++;
    }
  }
  function fitAyat() {
    var kotak = document.getElementById("ayat");
    var a = document.getElementById("arab"), t = document.getElementById("arti");
    a.style.fontSize = ""; t.style.fontSize = "";
    var fa = parseFloat(getComputedStyle(a).fontSize);
    var ft = parseFloat(getComputedStyle(t).fontSize), n = 0;
    while (kotak.scrollHeight > kotak.clientHeight && ft > 8.5 && n < 40) {
      fa *= 0.94; ft *= 0.94;
      a.style.fontSize = fa + "px";
      t.style.fontSize = ft + "px";
      n++;
    }
  }
  function sesuaikan() {
    fit(document.querySelector(".judul"));
    fit(document.querySelector(".subjudul"));
    if (window.fitAyat2) window.fitAyat2(); if (window.fitHadis) window.fitHadis();
  }

  var linkFont = null, kunciTerakhir = null;
  function terapkan() {
    var d = nomorHari(fmt.format(new Date())) - nomorHari(KONFIG.targetRamadhan);
    var urutan = (((d % 31) + 31) % 31) + 1;          // 1..31
    var nt = qs("tema") || qs("hari") || urutan;
    var nf = qs("font") || qs("hari") || urutan;
    var kunci = nt + "-" + nf;
    if (kunci === kunciTerakhir) return;
    kunciTerakhir = kunci;

    var el = document.querySelector(".kanvas");
    var w = TEMA[nt - 1];
    el.setAttribute("data-tema", "t" + nt);
    el.style.setProperty("--a", w[0]);
    el.style.setProperty("--g", rgba(w[0], 0.45));
    el.style.setProperty("--bg", rgba(w[0], 0.82, 0.07));
    el.style.setProperty("--t", campur(w[0], 0.85));
    el.style.setProperty("--r", w[1]);
    el.style.setProperty("--o1", rgba(w[0], 0.8, 0.05));
    el.style.setProperty("--o2", rgba(w[0], 0.38, 0.14));

    var f = FONT[(nf * 11) % 31];
    if (linkFont) linkFont.parentNode.removeChild(linkFont);
    linkFont = document.createElement("link");
    linkFont.rel = "stylesheet";
    var satu = ["DM Serif Display", "Abril Fatface", "Alfa Slab One", "Russo One", "Righteous", "Audiowide"];
    function bagian(n, b) { return "family=" + n.replace(/ /g, "+") + (satu.indexOf(n) >= 0 ? "" : ":wght@" + b); }
    linkFont.href = "https://fonts.googleapis.com/css2?" + bagian(f[0], "700") + "&" + bagian(f[1], "400;700") + "&display=swap";
    linkFont.onload = function () { setTimeout(sesuaikan, 200); };
    document.head.appendChild(linkFont);
    el.style.setProperty("--fh", '"' + f[0] + '"');
    el.style.setProperty("--fb", '"' + f[1] + '"');
    setTimeout(sesuaikan, 300);
    setTimeout(sesuaikan, 1500);
    setTimeout(sesuaikan, 3500);
  }

  terapkan();
  setInterval(terapkan, 30000);   // berganti sendiri lewat 00.00 WIB
})();

// ===== Latar bertema jaringan, AI, dan cyber security =====
(function () {
  var cv = document.getElementById("jaringan");
  if (!cv) return;
  var kv = cv.parentNode, cx = cv.getContext("2d");
  var W = 0, H = 0, N = [], frame = 0, warna = [63, 240, 255];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var LAB = ["AI", "NEURAL NET", "CYBER", "SSL", "DATA", "LLM", "0xFF", "FIREWALL", "CPU", "GPU"];

  function ukuran() {
    W = kv.clientWidth; H = kv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var jml = Math.max(24, Math.min(60, Math.round(W * H / 9000)));
    N = [];
    for (var i = 0; i < jml; i++) {
      N.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6,
        l: (i % 5 === 0) ? LAB[(i / 5 | 0) % LAB.length] : ""
      });
    }
  }

  function bacaWarna() {
    var h = (getComputedStyle(kv).getPropertyValue("--a") || "").trim().replace("#", "");
    if (h.length === 6) {
      warna = [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
  }

  function bumi(x0, y0, R, a, c) {
    cx.strokeStyle = "rgba(" + c + ",.38)";
    cx.lineWidth = 1;
    cx.beginPath(); cx.arc(x0, y0, R, 0, 6.283); cx.stroke();
    for (var k = 0; k < 3; k++) {
      var rx = Math.abs(Math.cos(a + k * Math.PI / 3)) * R;
      cx.beginPath(); cx.ellipse(x0, y0, Math.max(rx, 0.5), R, 0, 0, 6.283); cx.stroke();
    }
    [-0.5, 0, 0.5].forEach(function (f) {
      var rr = Math.sqrt(R * R - f * R * f * R);
      cx.beginPath(); cx.ellipse(x0, y0 + f * R, rr, rr * 0.22, 0, 0, 6.283); cx.stroke();
    });
  }

  function gambar() {
    frame++;
    if (frame % 90 === 1) bacaWarna();
    var c = warna.join(","), maks = W * 0.26, i, j;
    cx.clearRect(0, 0, W, H);

    for (i = 0; i < N.length; i++) {
      var n = N[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    cx.lineWidth = 0.8;
    for (i = 0; i < N.length; i++) {
      for (j = i + 1; j < N.length; j++) {
        var dx = N[i].x - N[j].x, dy = N[i].y - N[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < maks) {
          cx.strokeStyle = "rgba(" + c + "," + ((1 - d / maks) * 0.32) + ")";
          cx.beginPath(); cx.moveTo(N[i].x, N[i].y); cx.lineTo(N[j].x, N[j].y); cx.stroke();
        }
      }
    }
    cx.font = (W * 0.022) + "px Consolas, 'Courier New', monospace";
    for (i = 0; i < N.length; i++) {
      cx.fillStyle = "rgba(" + c + ",.75)";
      cx.beginPath(); cx.arc(N[i].x, N[i].y, N[i].r, 0, 6.283); cx.fill();
      if (N[i].l) {
        cx.fillStyle = "rgba(" + c + ",.5)";
        cx.fillText(N[i].l, N[i].x + 6, N[i].y - 6);
      }
    }
    var p = (frame % 120) / 120, pn = N[Math.floor(frame / 120) % N.length];
    cx.strokeStyle = "rgba(" + c + "," + ((1 - p) * 0.5) + ")";
    cx.lineWidth = 1.2;
    cx.beginPath(); cx.arc(pn.x, pn.y, 4 + p * W * 0.07, 0, 6.283); cx.stroke();

  }

  var diam = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function putar() {
    if (!document.hidden) gambar();
    if (!diam) requestAnimationFrame(putar);
  }
  ukuran(); bacaWarna();
  window.addEventListener("resize", ukuran);
  putar();
})();
