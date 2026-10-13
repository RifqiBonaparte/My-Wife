/* Fitur tambahan My-Wife. Kode utama tetap berada di index.html. */
(function () {
  "use strict";

  function mwSiap() {
    const mwMusic = document.getElementById("music");

    // Kontrol musik manual
    if (mwMusic) {
      const mwTombolLama = mwMusic.nextElementSibling;
      if (mwTombolLama && mwTombolLama.tagName === "BUTTON") {
        mwTombolLama.style.display = "none";
      }

      const mwPanel = document.createElement("section");
      mwPanel.id = "mwMusicPanel";
      mwPanel.setAttribute("aria-label", "Kontrol musik");
      mwPanel.innerHTML = `
        <h3>🎵 Musik untuk Dede</h3>
        <p id="mwMusicStatus" role="status" aria-live="polite">Musik belum diputar</p>
        <div class="mw-controls">
          <button type="button" id="mwPlay">▶️ Putar</button>
          <button type="button" id="mwPause">⏸️ Jeda</button>
          <button type="button" id="mwStop">⏹️ Berhenti</button>
        </div>
        <p><label for="mwVolume">🔊 Volume: <span id="mwVolumeText">70%</span></label></p>
        <input id="mwVolume" type="range" min="0" max="1" step="0.05" value="0.7" aria-label="Volume musik">
        <p><label for="mwMusicProgress">Progres lagu</label></p>
        <input id="mwMusicProgress" type="range" min="0" max="100" value="0" step="0.1" aria-label="Posisi lagu">
        <p id="mwMusicTime">00:00 / 00:00</p>
      `;

      const mwSisipkanSetelah = mwTombolLama && mwTombolLama.parentNode
        ? mwTombolLama
        : mwMusic;
      mwSisipkanSetelah.parentNode.insertBefore(mwPanel, mwSisipkanSetelah.nextSibling);

      const mwPlay = document.getElementById("mwPlay");
      const mwPause = document.getElementById("mwPause");
      const mwStop = document.getElementById("mwStop");
      const mwVolume = document.getElementById("mwVolume");
      const mwVolumeText = document.getElementById("mwVolumeText");
      const mwProgress = document.getElementById("mwMusicProgress");
      const mwStatus = document.getElementById("mwMusicStatus");
      const mwTime = document.getElementById("mwMusicTime");

      mwMusic.volume = 0.7;

      function mwFormatWaktu(mwDetik) {
        if (!Number.isFinite(mwDetik) || mwDetik < 0) mwDetik = 0;
        const mwMenit = Math.floor(mwDetik / 60);
        const mwSisaDetik = Math.floor(mwDetik % 60);
        return String(mwMenit).padStart(2, "0") + ":" + String(mwSisaDetik).padStart(2, "0");
      }

      function mwPerbaruiWaktu() {
        const mwDurasi = Number.isFinite(mwMusic.duration) ? mwMusic.duration : 0;
        mwTime.textContent = mwFormatWaktu(mwMusic.currentTime) + " / " + mwFormatWaktu(mwDurasi);
        if (mwDurasi > 0 && !mwProgress.matches(":active")) {
          mwProgress.value = String((mwMusic.currentTime / mwDurasi) * 100);
        }
      }

      mwPlay.addEventListener("click", function () {
        const mwHasilPutar = mwMusic.play();
        if (mwHasilPutar && typeof mwHasilPutar.catch === "function") {
          mwHasilPutar.catch(function () {
            mwStatus.textContent = "Lagu belum bisa diputar. Periksa file Dahsyat.mp3 dan coba lagi.";
          });
        }
      });

      mwPause.addEventListener("click", function () {
        mwMusic.pause();
      });

      mwStop.addEventListener("click", function () {
        mwMusic.pause();
        mwMusic.currentTime = 0;
        mwStatus.textContent = "Musik dihentikan";
        mwPerbaruiWaktu();
      });

      mwVolume.addEventListener("input", function () {
        mwMusic.volume = Number(mwVolume.value);
        mwVolumeText.textContent = Math.round(mwMusic.volume * 100) + "%";
      });

      mwProgress.addEventListener("input", function () {
        if (Number.isFinite(mwMusic.duration) && mwMusic.duration > 0) {
          mwMusic.currentTime = (Number(mwProgress.value) / 100) * mwMusic.duration;
        }
      });

      mwMusic.addEventListener("play", function () {
        mwStatus.textContent = "🎶 Musik sedang diputar";
      });
      mwMusic.addEventListener("pause", function () {
        if (mwMusic.currentTime > 0 && !mwMusic.ended) {
          mwStatus.textContent = "Musik dijeda";
        }
      });
      mwMusic.addEventListener("ended", function () {
        mwStatus.textContent = "Lagu selesai";
      });
      mwMusic.addEventListener("loadedmetadata", mwPerbaruiWaktu);
      mwMusic.addEventListener("timeupdate", mwPerbaruiWaktu);
      mwMusic.addEventListener("durationchange", mwPerbaruiWaktu);
      mwMusic.addEventListener("error", function () {
        mwStatus.textContent = "File musik belum ditemukan. Pastikan Dahsyat.mp3 ada di repository.";
      });
      mwPerbaruiWaktu();
    }

    // Pesan cinta acak yang bisa dibuka kapan saja
    const mwKotakUtama = document.getElementById("main");
    const mwKartuSambutan = document.getElementById("welcomeText");
    if (mwKotakUtama && mwKartuSambutan && !document.getElementById("mwLoveNote")) {
      const mwPesan = [
        "Di antara banyak hal baik hari ini, semoga kamu selalu ingat bahwa kamu berharga. 💗",
        "Kalau hari ini melelahkan, istirahat sebentar ya. Kamu tidak harus menyelesaikan semuanya sekaligus. 🌷",
        "Semoga hal-hal kecil hari ini bisa membuatmu tersenyum, seperti senyum yang ingin aku lihat darimu. ✨",
        "Terima kasih sudah menjadi bagian dari cerita yang ingin terus aku rawat. 💌",
        "Jangan lupa makan, minum air, dan memberi waktu untuk diri sendiri hari ini. 🫶",
        "Satu hari, satu kenangan, satu alasan baru untuk bersyukur. Semoga hari ini baik untukmu. 🌙",
        "Kalau bisa mengirim pelukan lewat layar, aku akan kirim satu yang hangat sekarang. 🤍"
      ];

      const mwKartu = document.createElement("section");
      mwKartu.className = "box";
      mwKartu.id = "mwLoveNote";
      const mwJudul = document.createElement("h3");
      mwJudul.textContent = "💌 Pesan Kecil untuk Dede";
      const mwIsi = document.createElement("p");
      mwIsi.id = "mwLoveNoteText";
      mwIsi.textContent = "Tekan tombol di bawah untuk membuka pesan kecil hari ini.";
      const mwTombol = document.createElement("button");
      mwTombol.type = "button";
      mwTombol.textContent = "Buka Pesan 💖";
      mwTombol.addEventListener("click", function () {
        const mwPilihan = Math.floor(Math.random() * mwPesan.length);
        mwIsi.textContent = mwPesan[mwPilihan];
      });
      mwKartu.appendChild(mwJudul);
      mwKartu.appendChild(mwIsi);
      mwKartu.appendChild(mwTombol);
      const mwKartuSambutanBox = mwKartuSambutan.closest(".box");
      if (mwKartuSambutanBox && mwKartuSambutanBox.parentNode) {
        mwKartuSambutanBox.parentNode.insertBefore(mwKartu, mwKartuSambutanBox.nextSibling);
      } else {
        mwKotakUtama.insertBefore(mwKartu, mwKotakUtama.firstChild);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mwSiap);
  } else {
    mwSiap();
  }
})();
