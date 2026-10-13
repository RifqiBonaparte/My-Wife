/* MY-WIFE — menu-per-halaman, semua panel lama dipertahankan */
(function () {
  "use strict";

  const MW_PAGES = [
    { id: "overview", label: "Beranda", icon: "⌂", title: "Ruang kecil kita", description: "Semua yang ingin kamu temukan hari ini, dalam satu tempat.", groups: ["countdown", "welcome", "note"] },
    { id: "profile", label: "Profil", icon: "◉", title: "Profil", description: "Atur nama dan cerita singkat yang tampil di ruang ini.", groups: ["profile"] },
    { id: "music", label: "Musik", icon: "♫", title: "Listening room", description: "Putar lagu, atur volume, atau lanjutkan saat kamu ingin.", groups: ["music"] },
    { id: "stories", label: "Cerita", icon: "▤", title: "Cerita kita", description: "Tempat meninggalkan pesan dan membaca cerita yang tersimpan.", groups: ["comments"] },
    { id: "play", label: "Mini game", icon: "✳", title: "Play room", description: "Istirahat sejenak dengan permainan singkat dan papan skor.", groups: ["game", "leaderboard"] },
    { id: "journal", label: "Jurnal", icon: "✎", title: "Catatan personal", description: "Mood, jurnal, rencana, dan kenangan dalam satu ruang pribadi.", groups: ["mood", "diary", "bucket", "memories", "counter"] },
    { id: "settings", label: "Pengaturan", icon: "⚙", title: "Pengaturan", description: "Sesuaikan tampilan dan kelola cadangan data lokal.", groups: ["settings"] }
  ];

  const MW_GROUP_MATCH = [
    ["countdown", /menuju hari kita/i],
    ["profile", /profil dede/i],
    ["welcome", /untuk dede tercinta/i],
    ["note", /pesan kecil untuk dede/i],
    ["music", /musik untuk dede/i],
    ["comments", /cerita kita/i],
    ["game", /tangkap hati dede/i],
    ["leaderboard", /leaderboard cinta/i],
    ["mood", /suasana hati hari ini/i],
    ["diary", /buku harian pribadi/i],
    ["bucket", /rencana|bucket list|ingin kita lakukan/i],
    ["memories", /linimasa kenangan|kenangan/i],
    ["counter", /hitung hari|tanggal spesial/i],
    ["settings", /pengaturan|preferensi/i]
  ];

  function mwGroupOf(element) {
    if (element.id === "mwMusicPanel" || element.id === "music") return "music";
    if (element.id === "mwLoveNote") return "note";
    const heading = element.querySelector ? element.querySelector("h2,h3,h4") : null;
    const text = heading ? heading.textContent.trim() : "";
    const found = MW_GROUP_MATCH.find(function (item) { return item[1].test(text); });
    if (found) return found[0];
    if (element.id === "mwMoodJournal") return "mood";
    if (element.id === "mwDiary") return "diary";
    if (element.id === "mwBucketList") return "bucket";
    if (element.id === "mwMemoryTimeline") return "memories";
    if (element.id === "mwTogetherCounter") return "counter";
    if (element.id === "mwSettings") return "settings";
    return null;
  }

  function mwBuildApp() {
    const main = document.getElementById("main");
    if (!main || main.dataset.mwRedesigned === "true") return;
    main.dataset.mwRedesigned = "true";

    const legacyNav = document.getElementById("mwFeatureNav");
    if (legacyNav) legacyNav.remove();

    const originalNodes = Array.from(main.children);
    const shell = document.createElement("div");
    shell.className = "mw-app-shell";
    const sidebar = document.createElement("aside");
    sidebar.className = "mw-sidebar";
    sidebar.setAttribute("aria-label", "Navigasi utama");
    const brand = document.createElement("div");
    brand.className = "mw-brand";
    const brandMark = document.createElement("span");
    brandMark.className = "mw-brand-mark";
    brandMark.textContent = "M.";
    const brandWords = document.createElement("span");
    const brandName = document.createElement("strong");
    brandName.textContent = "MY / WIFE";
    const brandSub = document.createElement("small");
    brandSub.textContent = "A PRIVATE LITTLE SPACE";
    brandWords.append(brandName, brandSub);
    brand.append(brandMark, brandWords);
    sidebar.appendChild(brand);
    const navLabel = document.createElement("div");
    navLabel.className = "mw-nav-label";
    navLabel.textContent = "YOUR SPACE";
    sidebar.appendChild(navLabel);
    const nav = document.createElement("nav");
    nav.className = "mw-side-nav";
    nav.setAttribute("aria-label", "Menu halaman");
    sidebar.appendChild(nav);
    const sidebarBottom = document.createElement("div");
    sidebarBottom.className = "mw-sidebar-bottom";
    const status = document.createElement("small");
    const dot = document.createElement("span");
    dot.className = "mw-status-dot";
    status.append(dot, document.createTextNode("Ruang pribadi"));
    sidebarBottom.appendChild(status);
    sidebar.appendChild(sidebarBottom);

    const workspace = document.createElement("div");
    workspace.className = "mw-workspace";
    const topbar = document.createElement("header");
    topbar.className = "mw-topbar";
    const breadcrumb = document.createElement("div");
    breadcrumb.className = "mw-breadcrumb";
    breadcrumb.textContent = "MY / WIFE     •     PRIVATE SPACE";
    const actions = document.createElement("div");
    actions.className = "mw-top-actions";
    const timePill = document.createElement("span");
    timePill.className = "mw-top-pill";
    timePill.textContent = "◌  YOUR OWN LITTLE UNIVERSE";
    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "mw-top-pill";
    logout.textContent = "Keluar ↗";
    logout.addEventListener("click", function () {
      if (typeof auth === "undefined" || !auth || !auth.currentUser) {
        window.location.reload();
        return;
      }
      auth.signOut().then(function () { window.location.reload(); })
        .catch(function () { window.alert("Belum bisa keluar. Coba lagi."); });
    });
    actions.append(timePill, logout);
    topbar.append(breadcrumb, actions);
    workspace.appendChild(topbar);

    const intro = document.createElement("section");
    intro.className = "mw-page-intro";
    const eyebrow = document.createElement("div");
    eyebrow.className = "mw-eyebrow";
    eyebrow.textContent = "A SPACE MADE WITH INTENTION";
    const title = document.createElement("h1");
    title.textContent = MW_PAGES[0].title;
    const description = document.createElement("p");
    description.textContent = MW_PAGES[0].description;
    intro.append(eyebrow, title, description);
    workspace.appendChild(intro);

    const pageHost = document.createElement("div");
    pageHost.className = "mw-pages";
    const pageMap = {};
    MW_PAGES.forEach(function (page, index) {
      const panel = document.createElement("section");
      panel.className = "mw-page-panel" + (index === 0 ? " mw-page-active" : "");
      panel.id = "mw-page-" + page.id;
      panel.setAttribute("aria-label", page.label);
      panel.hidden = index !== 0;
      const grid = document.createElement("div");
      grid.className = "mw-page-grid";
      panel.appendChild(grid);
      pageHost.appendChild(panel);
      pageMap[page.id] = { panel: panel, grid: grid };
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mw-side-link";
      button.dataset.page = page.id;
      button.setAttribute("aria-current", index === 0 ? "page" : "false");
      const icon = document.createElement("span");
      icon.className = "mw-side-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = page.icon;
      const label = document.createElement("span");
      label.textContent = page.label;
      button.append(icon, label);
      button.addEventListener("click", function () { mwShowPage(page.id); });
      nav.appendChild(button);
    });

    const footer = document.createElement("footer");
    footer.className = "mw-page-footer";
    const footerText = document.createElement("span");
    footerText.textContent = "Dibuat untuk menyimpan cerita, bukan membuatmu terus menggulir.";
    const footerTop = document.createElement("button");
    footerTop.type = "button";
    footerTop.textContent = "Kembali ke atas ↑";
    footerTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    footer.append(footerText, footerTop);
    workspace.append(pageHost, footer);
    shell.append(sidebar, workspace);
    main.replaceChildren(shell);

    // Klasifikasikan setiap panel lama dan pindahkan tanpa menghapus isinya.
    const groups = { countdown: [], profile: [], welcome: [], note: [], music: [], comments: [], game: [], leaderboard: [], mood: [], diary: [], bucket: [], memories: [], counter: [], settings: [] };
    originalNodes.forEach(function (node) {
      if (node.nodeType !== 1) return;
      const group = mwGroupOf(node);
      if (group && groups[group]) groups[group].push(node);
      else node.classList.add("mw-hidden-original");
    });

    MW_PAGES.forEach(function (page) {
      page.groups.forEach(function (group) {
        groups[group].forEach(function (node) {
          if (node.tagName === "AUDIO" || (node.tagName === "BUTTON" && node.textContent.includes("Putar Musik"))) {
            node.classList.add("mw-hidden-original");
          } else {
            pageMap[page.id].grid.appendChild(node);
          }
        });
      });
    });

    // Beranda lebih hidup: jadikan kartu countdown dan pesan satu kolom yang rapi.
    const musicAudio = document.getElementById("music");
    if (musicAudio) musicAudio.preload = "none";

    function mwShowPage(pageId) {
      const page = MW_PAGES.find(function (item) { return item.id === pageId; }) || MW_PAGES[0];
      MW_PAGES.forEach(function (item) {
        const active = item.id === page.id;
        const entry = pageMap[item.id];
        entry.panel.hidden = !active;
        entry.panel.classList.toggle("mw-page-active", active);
        const button = nav.querySelector('[data-page="' + item.id + '"]');
        if (button) button.setAttribute("aria-current", active ? "page" : "false");
      });
      title.textContent = page.title;
      description.textContent = page.description;
      breadcrumb.textContent = "MY / WIFE     •     " + page.label.toUpperCase();
      try { history.replaceState(null, "", "#" + page.id); } catch (error) {}
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Tangani tautan langsung ke menu, tanpa membocorkan data atau memuat ulang.
    window.addEventListener("hashchange", function () {
      const requested = location.hash.replace(/^#/, "");
      if (pageMap[requested]) mwShowPage(requested);
    });
    const initialPage = location.hash.replace(/^#/, "");
    if (pageMap[initialPage]) mwShowPage(initialPage);
  }

  // Login lama menampilkan #main setelah autentikasi. Bangun shell saat struktur fitur siap.
  function mwTryBuild() {
    const main = document.getElementById("main");
    if (main && !main.dataset.mwRedesigned) mwBuildApp();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mwTryBuild);
  } else {
    mwTryBuild();
  }
})();