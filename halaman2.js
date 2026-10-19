(function () {
  var h2 = document.querySelector("#h2 .kanvas-2");
  if (!h2) return;
  h2.classList.add("p2");
  h2.innerHTML =
    '<div class="p2-angka" id="p2-angka">--</div>' +
    '<div class="p2-hari" id="p2-hari">Hari Lagi</div>' +
    '<h2 class="p2-judul">Menuju Bulan Suci<br>Ramadhan 1448 H.</h2>' +
    '<div class="p2-hadis" id="p2-hadis"><span id="p2-teks">&gt; memuat hadis...</span></div>' +
    '<div class="p2-id">' +
      '<i>Email: adipranatasetiawan9@gmail.com</i><br>' +
      '<b>Student TEKNIK INFORMATIKA A\u00B2\u00B3</b><br>' +
      '<b>Affiliation: Islamic University of Madura</b><br>' +
      '<b class="ar" lang="ar" dir="rtl">\u0627\u0644\u0627\u0646\u062A\u0633\u0627\u0628: \u0627\u0644\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0641\u064A \u0645\u0627\u062F\u0648\u0631\u0627/\u0628\u0627\u0645\u064A\u0643\u0627\u0633\u0627\u0646</b>' +
    '</div>' +
    '<div class="p2-catatan">foto masjid dipasang di tahap berikutnya</div>';

  function $(id) { return document.getElementById(id); }

  var fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KONFIG.zona, year: "numeric", month: "2-digit", day: "2-digit"
  });
  function nomor(k) {
    var p = k.split("-");
    return Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
  }
  function sisa() {
    try {
      var q = parseInt(new URLSearchParams(location.search).get("sisa"), 10);
      if (!isNaN(q)) return q;          // uji tampilan: ?sisa=107
    } catch (e) {}
    return nomor(KONFIG.targetRamadhan) - nomor(fmt.format(new Date()));
  }

  function muatkan() {
    var kotak = $("p2-hadis");
    kotak.style.fontSize = "";
    var f = parseFloat(getComputedStyle(kotak).fontSize), n = 0;
    while (kotak.scrollHeight > kotak.clientHeight + 1 && f > 6.5 && n < 40) {
      f *= 0.95;
      kotak.style.fontSize = f + "px";
      n++;
    }
  }

  var terakhir = "";
  function perbarui() {
    var d = sisa();
    $("p2-angka").textContent = d > 0 ? d : 0;
    $("p2-hari").textContent = d > 0 ? "Hari Lagi" : "Telah Tiba";

    var t = document.getElementById("hteks"), r = document.getElementById("hhref");
    var teks = t ? t.textContent.trim() : "";
    if (!teks || teks.indexOf("memuat") !== -1 || teks.indexOf("belum bisa") !== -1) return;
    var rujukan = r ? r.textContent.split("\u2022")[0].trim() : "";
    var isi = teks + (rujukan ? " (" + rujukan + ")" : "");
    if (isi === terakhir) return;
    terakhir = isi;
    $("p2-teks").textContent = isi;
    muatkan();
  }

  perbarui();
  setInterval(perbarui, 1000);
})();
