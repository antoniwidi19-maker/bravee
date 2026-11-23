# ORBITA — Satellite Landing Page

Website satu halaman bergaya sinematik dengan efek scroll. Tiap scroll ganti scene dengan zoom dan crossfade halus. Semua visual digambar pakai SVG dan CSS, jadi tidak butuh gambar atau library eksternal.

## Isi Folder


orbita/
├── index.html   # struktur halaman + 4 scene SVG
├── style.css    # tampilan + semua animasi
├── script.js    # logika scroll + generator bintang
└── README.md


## Cara Pakai

1. Taruh ketiga file (index.html, style.css, script.js) dalam satu folder.
2. Buka index.html di browser (klik dua kali, tanpa server).
3. Scroll ke bawah.

## Scene

| # | Scene | Isi |
|---|-------|-----|
| 1 | Satellites & launch vehicles | Bumi, satelit melayang, bintang |
| 2 | Engineered in-house | Closeup hardware + plat nama |
| 3 | Built at scale | Pabrik dan roket |
| 4 | We build the road to orbit | Launch pad + tombol CTA |

## Animasi

- *Bintang*: 160 bintang kelap-kelip, durasi dan delay acak. Ada bintang jatuh tiap 9 detik.
- *Satelit*: melayang pelan, LED berkedip, panel surya berkilau.
- *Bumi*: garis atmosfer berdenyut.
- *Hardware dan pabrik*: LED status berkedip, sorot lampu berkedip halus.
- *Launch pad*: api roket berkedip, lampu peringatan menyala.
- Animasi otomatis mati kalau device diatur reduce motion.

## Kustomisasi

*Ganti teks dan brand*
Edit index.html: cari ORBITA, bagian <div class="cap">, dan tombol Contact / Start a mission.

*Ganti warna*
Edit variabel di atas style.css:
css
:root{--bg:#02040a;--fg:#eef3fa;--mute:#8fa0b8;--acc:#5aa9ff}


*Atur kecepatan kedip*
Di bagian ANIMASI pada style.css, ubah durasinya, misalnya 1.2s pada .led atau 3s pada .flick.

*Jumlah bintang*
Di script.js, ubah angka 160 pada for(i=0;i<160;i++).

*Tambah atau kurangi scene*
1. Tambah <div class="scene" id="sN"> di index.html.
2. Tambah caption <div class="cap" data-i="N"> dan satu <i></i> di .prog.
3. Ubah tinggi #track di style.css (500vh, sekitar 100vh per scene).

*Pakai foto atau video sendiri*
Ganti isi <svg> pada scene dengan:
html
<img src="foto.jpg" style="width:100%;height:100%;object-fit:cover">


## Catatan

- Kompatibel dengan browser modern (Chrome, Safari, Firefox, Edge) di desktop dan HP.
- Brand "ORBITA" fiktif, hanya untuk konsep
