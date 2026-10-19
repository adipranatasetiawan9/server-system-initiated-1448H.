(function () {
  var p = document.getElementById("pager");
  var titik = document.querySelectorAll(".titik button");
  var petunjuk = document.getElementById("petunjuk");
  var jumlah = titik.length;

  function ke(i) {
    i = Math.max(0, Math.min(jumlah - 1, i));
    p.scrollTo({ left: i * p.clientWidth, behavior: "smooth" });
  }
  function sekarang() { return Math.round(p.scrollLeft / p.clientWidth); }

  function perbarui() {
    var i = sekarang();
    titik.forEach(function (t, k) { t.classList.toggle("on", k === i); });
    var terakhir = (i === jumlah - 1);
    petunjuk.textContent = terakhir ? "\u2039 kembali" : "geser \u203A";
    petunjuk.classList.toggle("kiri", terakhir);
  }

  p.addEventListener("scroll", perbarui, { passive: true });
  titik.forEach(function (t, k) { t.addEventListener("click", function () { ke(k); }); });
  petunjuk.addEventListener("click", function () {
    ke(sekarang() === jumlah - 1 ? sekarang() - 1 : sekarang() + 1);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") ke(sekarang() + 1);
    if (e.key === "ArrowLeft") ke(sekarang() - 1);
  });
  window.addEventListener("resize", function () { ke(sekarang()); });
  perbarui();
})();
