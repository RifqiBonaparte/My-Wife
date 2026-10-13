/* Fitur tambahan My-Wife. Semua catatan baru disimpan lokal di browser. */
(function () {
  "use strict";

  const MW_PREFIX = "mw_private_";
  const MW_KEYS = {
    mood: MW_PREFIX + "mood",
    diary: MW_PREFIX + "diary",
    bucket: MW_PREFIX + "bucket",
    memories: MW_PREFIX + "memories",
    startDate: MW_PREFIX + "start_date",
    light: MW_PREFIX + "light_theme",
    fontScale: MW_PREFIX + "font_scale",
    reduceMotion: MW_PREFIX + "reduce_motion"
  };

  function mwTodayISO() {
    const date = new Date();
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function mwRead(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function mwWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      mwToast("Penyimpanan browser penuh atau tidak tersedia. Coba ekspor atau hapus sebagian catatan.");
      return false;
    }
  }

  function mwToast(message) {
    let toast = document.getElementById("mwToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "mwToast";
      toast.className = "mw-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("mw-toast-show");
    window.clearTimeout(toast._mwTimer);
    toast._mwTimer = window.setTimeout(function () {
      toast.classList.remove("mw-toast-show");
    }, 2600);
  }

  function mwMake(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function mwLoadFeatures() {
    const mwMain = document.getElementById("main");
    if (!mwMain || document.getElementById("mwFeatureNav")) return;

    // Menu navigasi dibuat dari bagian yang memang sudah ada.
    const mwSections = [
      { id: "mw-section-countdown", match: /menuju hari kita/i, label: "⏳ Countdown" },
      { id: "mw-section-profile", match: /profil dede/i, label: "👤 Profil" },
      { id: "mw-section-welcome", match: /untuk dede tercinta/i, label: "💌 Pesan" },
      { id: "mw-section-music", match: /musik untuk dede/i, label: "🎵 Musik" },
      { id: "mw-section-note", match: /pesan kecil untuk dede/i, label: "💗 Pesan harian" },
      { id: "mw-section-comments", match: /cerita kita/i, label: "💬 Cerita" },
      { id: "mw-section-game", match: /tangkap hati dede/i, label: "🎮 Game" },
      { id: "mw-section-leaderboard", match: /leaderboard cinta/i, label: "🏆 Skor" }
    ];

    mwMain.querySelectorAll(".box, #mwMusicPanel").forEach(function (mwBox, index) {
      const mwHeading = mwBox.querySelector("h2, h3, h4");
      const mwHeadingText = mwHeading ? mwHeading.textContent.trim() : "";
      const mwMatch = mwSections.find(function (section) {
        return section.match.test(mwHeadingText);
      });
      // Pertahankan ID yang dipakai kontrol musik dan pesan tambahan.
      if (mwMatch) {
        if (mwBox.id !== "mwMusicPanel" && mwBox.id !== "mwLoveNote") {
          mwBox.id = mwMatch.id;
        }
      } else if (!mwBox.id) {
        mwBox.id = "mw-section-extra-" + index;
      }
    });

    const mwNav = mwMake("nav", "mw-feature-nav");
    mwNav.id = "mwFeatureNav";
    mwNav.setAttribute("aria-label", "Menu cepat My-Wife");
    const mwNavTitle = mwMake("span", "mw-nav-title", "💖 My-Wife");
    mwNav.appendChild(mwNavTitle);

    const mwNavLinks = mwMake("div", "mw-nav-links");
    mwSections.forEach(function (section) {
      if (document.getElementById(section.id)) {
        const link = mwMake("a", "mw-nav-link", section.label);
        link.href = "#" + section.id;
        mwNavLinks.appendChild(link);
      }
    });
    mwNav.appendChild(mwNavLinks);

    const mwNavActions = mwMake("div", "mw-nav-actions");
    const mwTopButton = mwMake("button", "mw-small-button", "⬆ Atas");
    mwTopButton.type = "button";
    mwTopButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    mwNavActions.appendChild(mwTopButton);

    const mwLogout = mwMake("button", "mw-small-button", "Keluar");
    mwLogout.type = "button";
    mwLogout.addEventListener("click", function () {
      if (typeof auth === "undefined" || !auth || !auth.currentUser) {
        mwToast("Sesi login tidak ditemukan.");
        return;
      }
      auth.signOut().then(function () {
        window.location.reload();
      }).catch(function () {
        mwToast("Belum bisa keluar. Coba lagi.");
      });
    });
    mwNavActions.appendChild(mwLogout);
    mwNav.appendChild(mwNavActions);
    mwMain.insertBefore(mwNav, mwMain.firstChild);

    // Panel mood harian.
    const mwMoodCard = mwMake("section", "box mw-feature-card");
    mwMoodCard.id = "mwMoodJournal";
    mwMoodCard.appendChild(mwMake("h3", "", "🌈 Suasana Hati Hari Ini"));
    mwMoodCard.appendChild(mwMake("p", "mw-muted", "Pilih emoji yang paling mewakili harimu. Riwayat hanya tersimpan di browser ini."));
    const mwMoodChoices = mwMake("div", "mw-mood-choices");
    const mwMoods = [
      { value: "senang", emoji: "😊", label: "Senang" },
      { value: "tenang", emoji: "😌", label: "Tenang" },
      { value: "semangat", emoji: "✨", label: "Semangat" },
      { value: "lelah", emoji: "😴", label: "Lelah" },
      { value: "sedih", emoji: "🌧️", label: "Sedih" }
    ];
    const mwMoodToday = mwTodayISO();
    let mwMoodHistory = mwRead(MW_KEYS.mood, []);
    if (!Array.isArray(mwMoodHistory)) mwMoodHistory = [];

    function mwRenderMoods() {
      mwMoodChoices.replaceChildren();
      mwMoods.forEach(function (mood) {
        const button = mwMake("button", "mw-mood-button", mood.emoji + " " + mood.label);
        button.type = "button";
        button.setAttribute("aria-pressed", String(mwMoodHistory.some(function (entry) {
          return entry.date === mwMoodToday && entry.mood === mood.value;
        })));
        button.addEventListener("click", function () {
          mwMoodHistory = mwMoodHistory.filter(function (entry) { return entry.date !== mwMoodToday; });
          mwMoodHistory.push({ date: mwMoodToday, mood: mood.value, emoji: mood.emoji, label: mood.label });
          mwMoodHistory.sort(function (a, b) { return b.date.localeCompare(a.date); });
          mwMoodHistory = mwMoodHistory.slice(0, 30);
          if (mwWrite(MW_KEYS.mood, mwMoodHistory)) {
            mwRenderMoods();
            mwRenderMoodHistory();
            mwToast("Mood hari ini tersimpan 💗");
          }
        });
        mwMoodChoices.appendChild(button);
      });
    }

    const mwMoodHistoryBox = mwMake("div", "mw-mood-history");
    function mwRenderMoodHistory() {
      mwMoodHistoryBox.replaceChildren();
      if (!mwMoodHistory.length) {
        mwMoodHistoryBox.appendChild(mwMake("p", "mw-muted", "Belum ada catatan mood."));
        return;
      }
      mwMoodHistory.slice(0, 7).forEach(function (entry) {
        mwMoodHistoryBox.appendChild(mwMake("span", "mw-history-chip", entry.emoji + " " + entry.label + " · " + entry.date));
      });
    }
    mwMoodCard.appendChild(mwMoodChoices);
    mwMoodCard.appendChild(mwMoodHistoryBox);

    // Buku harian pribadi, autosimpan.
    const mwDiaryCard = mwMake("section", "box mw-feature-card");
    mwDiaryCard.id = "mwDiary";
    mwDiaryCard.appendChild(mwMake("h3", "", "📔 Buku Harian Pribadi"));
    mwDiaryCard.appendChild(mwMake("p", "mw-muted", "Catatan ini hanya tersimpan di penyimpanan browser perangkat ini, bukan di Firebase."));
    const mwDiary = document.createElement("textarea");
    mwDiary.id = "mwDiaryText";
    mwDiary.rows = 5;
    mwDiary.maxLength = 5000;
    mwDiary.placeholder = "Tulis cerita hari ini di sini...";
    mwDiary.value = String(mwRead(MW_KEYS.diary, ""));
    mwDiary.setAttribute("aria-label", "Isi buku harian pribadi");
    const mwDiaryStatus = mwMake("p", "mw-muted", "Tersimpan otomatis saat kamu mengetik.");
    const mwDiaryButtons = mwMake("div", "mw-feature-actions");
    const mwDiaryExport = mwMake("button", "", "Unduh Catatan .txt");
    mwDiaryExport.type = "button";
    mwDiaryExport.addEventListener("click", function () {
      const blob = new Blob([mwDiary.value], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "catatan-my-wife.txt";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      mwToast("Catatan disiapkan untuk diunduh.");
    });
    const mwDiaryClear = mwMake("button", "mw-secondary-button", "Kosongkan Catatan");
    mwDiaryClear.type = "button";
    mwDiaryClear.addEventListener("click", function () {
      if (!window.confirm("Hapus isi buku harian di browser ini?")) return;
      mwDiary.value = "";
      mwWrite(MW_KEYS.diary, "");
      mwDiaryStatus.textContent = "Catatan dikosongkan.";
    });
    mwDiaryButtons.append(mwDiaryExport, mwDiaryClear);
    let mwDiaryTimer = null;
    mwDiary.addEventListener("input", function () {
      window.clearTimeout(mwDiaryTimer);
      mwDiaryStatus.textContent = "Menyimpan...";
      mwDiaryTimer = window.setTimeout(function () {
        if (mwWrite(MW_KEYS.diary, mwDiary.value)) {
          mwDiaryStatus.textContent = "Tersimpan otomatis.";
        }
      }, 350);
    });
    mwDiaryCard.append(mwDiary, mwDiaryStatus, mwDiaryButtons);

    // Daftar aktivitas impian.
    const mwBucketCard = mwMake("section", "box mw-feature-card");
    mwBucketCard.id = "mwBucketList";
    mwBucketCard.appendChild(mwMake("h3", "", "📝 Daftar Hal yang Ingin Kita Lakukan"));
    const mwBucketForm = mwMake("form", "mw-inline-form");
    const mwBucketInput = document.createElement("input");
    mwBucketInput.type = "text";
    mwBucketInput.maxLength = 120;
    mwBucketInput.placeholder = "Contoh: jalan sore bersama";
    mwBucketInput.required = true;
    mwBucketInput.setAttribute("aria-label", "Aktivitas baru");
    const mwBucketSubmit = mwMake("button", "", "Tambah");
    mwBucketSubmit.type = "submit";
    mwBucketForm.append(mwBucketInput, mwBucketSubmit);
    const mwBucketList = mwMake("ul", "mw-check-list");
    let mwBucketItems = mwRead(MW_KEYS.bucket, []);
    if (!Array.isArray(mwBucketItems)) mwBucketItems = [];

    function mwRenderBucket() {
      mwBucketList.replaceChildren();
      if (!mwBucketItems.length) {
        mwBucketList.appendChild(mwMake("li", "mw-muted", "Belum ada rencana. Tambahkan ide kecil dulu!"));
        return;
      }
      mwBucketItems.forEach(function (item, index) {
        const row = mwMake("li", "mw-check-row" + (item.done ? " mw-done" : ""));
        const label = mwMake("label", "mw-check-label");
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = Boolean(item.done);
        check.addEventListener("change", function () {
          mwBucketItems[index].done = check.checked;
          mwWrite(MW_KEYS.bucket, mwBucketItems);
          mwRenderBucket();
        });
        label.append(check, mwMake("span", "", item.text));
        const remove = mwMake("button", "mw-icon-button", "Hapus");
        remove.type = "button";
        remove.setAttribute("aria-label", "Hapus aktivitas " + item.text);
        remove.addEventListener("click", function () {
          mwBucketItems.splice(index, 1);
          mwWrite(MW_KEYS.bucket, mwBucketItems);
          mwRenderBucket();
        });
        row.append(label, remove);
        mwBucketList.appendChild(row);
      });
    }
    mwBucketForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = mwBucketInput.value.trim();
      if (!value) return;
      mwBucketItems.push({ text: value, done: false, createdAt: new Date().toISOString() });
      if (mwWrite(MW_KEYS.bucket, mwBucketItems)) {
        mwBucketInput.value = "";
        mwRenderBucket();
      }
    });
    mwBucketCard.append(mwBucketForm, mwBucketList);

    // Linimasa kenangan.
    const mwMemoryCard = mwMake("section", "box mw-feature-card");
    mwMemoryCard.id = "mwMemoryTimeline";
    mwMemoryCard.appendChild(mwMake("h3", "", "🗓️ Linimasa Kenangan"));
    const mwMemoryForm = mwMake("form", "mw-memory-form");
    const mwMemoryDate = document.createElement("input");
    mwMemoryDate.type = "date";
    mwMemoryDate.required = true;
    mwMemoryDate.value = mwTodayISO();
    mwMemoryDate.setAttribute("aria-label", "Tanggal kenangan");
    const mwMemoryTitle = document.createElement("input");
    mwMemoryTitle.type = "text";
    mwMemoryTitle.maxLength = 100;
    mwMemoryTitle.placeholder = "Judul kenangan";
    mwMemoryTitle.required = true;
    const mwMemoryDescription = document.createElement("textarea");
    mwMemoryDescription.rows = 2;
    mwMemoryDescription.maxLength = 500;
    mwMemoryDescription.placeholder = "Ceritakan sedikit tentang momen itu...";
    mwMemoryDescription.setAttribute("aria-label", "Deskripsi kenangan");
    const mwMemorySubmit = mwMake("button", "", "Simpan Kenangan");
    mwMemorySubmit.type = "submit";
    mwMemoryForm.append(mwMemoryDate, mwMemoryTitle, mwMemoryDescription, mwMemorySubmit);
    const mwMemoryList = mwMake("div", "mw-memory-list");
    let mwMemories = mwRead(MW_KEYS.memories, []);
    if (!Array.isArray(mwMemories)) mwMemories = [];

    function mwRenderMemories() {
      mwMemoryList.replaceChildren();
      if (!mwMemories.length) {
        mwMemoryList.appendChild(mwMake("p", "mw-muted", "Kenangan yang kamu simpan akan muncul di sini."));
        return;
      }
      mwMemories.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).forEach(function (memory) {
        const card = mwMake("article", "mw-memory-item");
        card.appendChild(mwMake("p", "mw-memory-date", memory.date));
        card.appendChild(mwMake("h4", "", memory.title));
        if (memory.description) card.appendChild(mwMake("p", "", memory.description));
        const remove = mwMake("button", "mw-secondary-button", "Hapus Kenangan");
        remove.type = "button";
        remove.addEventListener("click", function () {
          mwMemories = mwMemories.filter(function (entry) { return entry.id !== memory.id; });
          mwWrite(MW_KEYS.memories, mwMemories);
          mwRenderMemories();
        });
        card.appendChild(remove);
        mwMemoryList.appendChild(card);
      });
    }
    mwMemoryForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const title = mwMemoryTitle.value.trim();
      if (!title || !mwMemoryDate.value) return;
      mwMemories.push({
        id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
        date: mwMemoryDate.value,
        title: title,
        description: mwMemoryDescription.value.trim()
      });
      if (mwWrite(MW_KEYS.memories, mwMemories)) {
        mwMemoryTitle.value = "";
        mwMemoryDescription.value = "";
        mwRenderMemories();
        mwToast("Kenangan disimpan 💌");
      }
    });
    mwMemoryCard.append(mwMemoryForm, mwMemoryList);

    // Penghitung hari sejak tanggal yang dipilih sendiri.
    const mwCounterCard = mwMake("section", "box mw-feature-card");
    mwCounterCard.id = "mwTogetherCounter";
    mwCounterCard.appendChild(mwMake("h3", "", "💞 Hitung Hari dari Tanggal Spesial"));
    mwCounterCard.appendChild(mwMake("p", "mw-muted", "Pilih tanggal awal yang kamu inginkan. Tidak ada tanggal yang ditetapkan otomatis."));
    const mwCounterForm = mwMake("form", "mw-inline-form");
    const mwCounterDate = document.createElement("input");
    mwCounterDate.type = "date";
    mwCounterDate.value = String(mwRead(MW_KEYS.startDate, ""));
    mwCounterDate.setAttribute("aria-label", "Tanggal awal untuk penghitung hari");
    const mwCounterSubmit = mwMake("button", "", "Simpan Tanggal");
    mwCounterSubmit.type = "submit";
    mwCounterForm.append(mwCounterDate, mwCounterSubmit);
    const mwCounterResult = mwMake("p", "mw-counter-result", "Pilih tanggal untuk mulai menghitung.");
    function mwUpdateCounter() {
      const value = mwCounterDate.value;
      if (!value) {
        mwCounterResult.textContent = "Pilih tanggal untuk mulai menghitung.";
        return;
      }
      const selected = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(selected.getTime()) || selected > today) {
        mwCounterResult.textContent = "Tanggal harus hari ini atau tanggal sebelumnya.";
        return;
      }
      const days = Math.floor((today.getTime() - selected.getTime()) / 86400000);
      mwCounterResult.textContent = days.toLocaleString("id-ID") + " hari sejak " + selected.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) + " 💗";
    }
    mwCounterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!mwCounterDate.value) {
        mwToast("Pilih tanggal terlebih dahulu.");
        return;
      }
      const selected = new Date(mwCounterDate.value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(selected.getTime()) || selected > today) {
        mwToast("Pilih tanggal yang valid dan tidak di masa depan.");
        return;
      }
      if (mwWrite(MW_KEYS.startDate, mwCounterDate.value)) {
        mwUpdateCounter();
        mwToast("Tanggal spesial disimpan.");
      }
    });
    mwCounterCard.append(mwCounterForm, mwCounterResult);

    // Preferensi tampilan dan cadangan data lokal.
    const mwSettingsCard = mwMake("section", "box mw-feature-card");
    mwSettingsCard.id = "mwSettings";
    mwSettingsCard.appendChild(mwMake("h3", "", "⚙️ Pengaturan & Cadangan"));
    const mwThemeRow = mwMake("div", "mw-setting-row");
    mwThemeRow.appendChild(mwMake("span", "", "Tema tampilan"));
    const mwThemeButton = mwMake("button", "", "🌙 Ganti Tema");
    mwThemeButton.type = "button";
    mwThemeButton.addEventListener("click", function () {
      const light = !document.body.classList.contains("mw-light-theme");
      document.body.classList.toggle("mw-light-theme", light);
      mwWrite(MW_KEYS.light, light);
      mwThemeButton.textContent = light ? "🌌 Tema Gelap" : "☀️ Tema Terang";
    });
    mwThemeRow.appendChild(mwThemeButton);

    const mwFontRow = mwMake("div", "mw-setting-row");
    const mwFontLabel = mwMake("label", "", "Ukuran teks");
    const mwFont = document.createElement("input");
    mwFont.type = "range";
    mwFont.min = "0.9";
    mwFont.max = "1.2";
    mwFont.step = "0.05";
    mwFont.value = String(mwRead(MW_KEYS.fontScale, 1));
    mwFontLabel.appendChild(mwFont);
    mwFontRow.appendChild(mwFontLabel);
    mwFont.addEventListener("input", function () {
      document.documentElement.style.setProperty("--mw-font-scale", mwFont.value);
      mwWrite(MW_KEYS.fontScale, Number(mwFont.value));
    });

    const mwMotionRow = mwMake("div", "mw-setting-row");
    mwMotionRow.appendChild(mwMake("span", "", "Animasi"));
    const mwMotionButton = mwMake("button", "mw-secondary-button", "Kurangi Animasi");
    mwMotionButton.type = "button";
    mwMotionButton.addEventListener("click", function () {
      const reduced = !document.body.classList.contains("mw-reduced-motion");
      document.body.classList.toggle("mw-reduced-motion", reduced);
      mwWrite(MW_KEYS.reduceMotion, reduced);
      mwMotionButton.textContent = reduced ? "Aktifkan Animasi" : "Kurangi Animasi";
    });
    mwMotionRow.appendChild(mwMotionButton);

    const mwBackupButtons = mwMake("div", "mw-feature-actions");
    const mwBackup = mwMake("button", "", "Unduh Cadangan Data (.json)");
    mwBackup.type = "button";
    mwBackup.addEventListener("click", function () {
      const backup = {};
      Object.keys(MW_KEYS).forEach(function (key) {
        backup[key] = mwRead(MW_KEYS[key], null);
      });
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data: backup }, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "cadangan-my-wife.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      mwToast("Cadangan data berhasil disiapkan.");
    });
    const mwClearLocal = mwMake("button", "mw-danger-button", "Hapus Semua Data Lokal");
    mwClearLocal.type = "button";
    mwClearLocal.addEventListener("click", function () {
      if (!window.confirm("Hapus mood, buku harian, daftar aktivitas, kenangan, tanggal spesial, dan preferensi lokal di browser ini? Data Firebase seperti akun dan komentar tidak dihapus.")) return;
      Object.keys(MW_KEYS).forEach(function (key) {
        try { localStorage.removeItem(MW_KEYS[key]); } catch (error) {}
      });
      window.location.reload();
    });
    mwBackupButtons.append(mwBackup, mwClearLocal);
    mwSettingsCard.append(mwThemeRow, mwFontRow, mwMotionRow, mwBackupButtons);

    mwMain.append(mwMoodCard, mwDiaryCard, mwBucketCard, mwMemoryCard, mwCounterCard, mwSettingsCard);

    [
      { id: "mwMoodJournal", label: "🌈 Mood" },
      { id: "mwDiary", label: "📔 Diary" },
      { id: "mwBucketList", label: "📝 Rencana" },
      { id: "mwMemoryTimeline", label: "🗓️ Kenangan" },
      { id: "mwTogetherCounter", label: "💞 Hitung hari" },
      { id: "mwSettings", label: "⚙️ Pengaturan" }
    ].forEach(function (section) {
      const link = mwMake("a", "mw-nav-link", section.label);
      link.href = "#" + section.id;
      mwNavLinks.appendChild(link);
    });

    // Terapkan preferensi yang tersimpan.
    if (mwRead(MW_KEYS.light, false)) {
      document.body.classList.add("mw-light-theme");
      mwThemeButton.textContent = "🌌 Tema Gelap";
    }
    const savedScale = Number(mwRead(MW_KEYS.fontScale, 1));
    if (Number.isFinite(savedScale) && savedScale >= 0.9 && savedScale <= 1.2) {
      document.documentElement.style.setProperty("--mw-font-scale", String(savedScale));
      mwFont.value = String(savedScale);
    }
    if (mwRead(MW_KEYS.reduceMotion, false)) {
      document.body.classList.add("mw-reduced-motion");
      mwMotionButton.textContent = "Aktifkan Animasi";
    }
    mwRenderMoods();
    mwRenderMoodHistory();
    mwRenderBucket();
    mwRenderMemories();
    mwUpdateCounter();

    // Cari komentar yang sudah dimuat oleh Firebase.
    const mwCommentList = document.getElementById("listKomentar");
    if (mwCommentList) {
      const mwCommentCard = mwCommentList.closest(".box");
      if (mwCommentCard && !document.getElementById("mwCommentSearch")) {
        const search = document.createElement("input");
        search.id = "mwCommentSearch";
        search.type = "search";
        search.placeholder = "🔎 Cari di cerita kita...";
        search.setAttribute("aria-label", "Cari komentar");
        mwCommentCard.insertBefore(search, mwCommentList);
        function filterComments() {
          const query = search.value.trim().toLocaleLowerCase("id");
          Array.from(mwCommentList.children).forEach(function (bubble) {
            bubble.hidden = !bubble.textContent.toLocaleLowerCase("id").includes(query);
          });
        }
        search.addEventListener("input", filterComments);
        const observer = new MutationObserver(filterComments);
        observer.observe(mwCommentList, { childList: true, subtree: true });
      }
    }

    // Pemulihan kata sandi tanpa mengubah alur login lama.
    const mwLoginBox = document.getElementById("loginBox");
    if (mwLoginBox && !document.getElementById("mwResetPassword")) {
      const resetButton = mwMake("button", "mw-secondary-button", "Lupa Password?");
      resetButton.id = "mwResetPassword";
      resetButton.type = "button";
      resetButton.addEventListener("click", function () {
        const emailInput = document.getElementById("email");
        const email = emailInput ? emailInput.value.trim() : "";
        if (!email) {
          mwToast("Isi email terlebih dahulu, lalu tekan Lupa Password.");
          if (emailInput) emailInput.focus();
          return;
        }
        if (typeof auth === "undefined" || !auth) {
          mwToast("Layanan login belum siap. Muat ulang halaman dan coba lagi.");
          return;
        }
        auth.sendPasswordResetEmail(email).then(function () {
          mwToast("Jika email terdaftar, petunjuk reset password akan dikirim.");
        }).catch(function () {
          mwToast("Reset password belum berhasil. Periksa email dan pengaturan Firebase.");
        });
      });
      mwLoginBox.appendChild(resetButton);
    }

    // Tombol kembali ke atas yang muncul saat halaman digulir.
    const mwBackTop = mwMake("button", "mw-back-top", "↑");
    mwBackTop.type = "button";
    mwBackTop.setAttribute("aria-label", "Kembali ke atas");
    mwBackTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(mwBackTop);
    window.addEventListener("scroll", function () {
      mwBackTop.classList.toggle("mw-back-top-visible", window.scrollY > 350);
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mwLoadFeatures);
  } else {
    mwLoadFeatures();
  }
})();