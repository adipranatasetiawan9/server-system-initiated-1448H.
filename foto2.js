(function () {
  var h2 = document.querySelector("#h2 .kanvas-2");
  if (!h2 || !window.MASJID || !window.MASJID.length) return;

  // Foto yang dilewati (misalnya yang terlalu buram). Hapus namanya kalau sudah diganti.
  var LEWATI = ["m11.jpg"];
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
  function pilih() {
    try {
      var q = parseInt(new URLSearchParams(location.search).get("masjid"), 10);
      if (q >= 1 && q <= window.MASJID.length) return window.MASJID[q - 1];  // uji: ?masjid=5
    } catch (e) {}
    return daftar[nomor(fmt.format(new Date())) % daftar.length];
  }

  var catatan = h2.querySelector(".p2-catatan");
  if (catatan) catatan.parentNode.removeChild(catatan);

  var f = document.createElement("div");
  f.className = "p2-foto";
  h2.insertBefore(f, h2.firstChild);

  var dipakai = "";
  function pasang() {
    var u = pilih();
    if (u === dipakai) return;
    var im = new Image();
    im.onload = function () {
      f.style.backgroundImage = 'url("' + encodeURI(u) + '")';
      f.classList.add("tampil");
      dipakai = u;
    };
    im.src = encodeURI(u);
  }
  pasang();
  setInterval(pasang, 30000);   // berganti sendiri lewat 00.00 WIB
})();
