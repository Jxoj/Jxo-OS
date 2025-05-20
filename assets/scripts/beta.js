// beta.js

// —————— Initialization ——————
document.addEventListener("DOMContentLoaded", () => {
  sessionStorage.removeItem("loggedIn");
  restoreOSTheme();
  loadInstalledApps().then(() => {
    installJstoreIfNotInstalled();
    installSettingsIfNotInstalled();
    renderDesktop();
    initSettingsApp();
  });
});

// —————— Core State ——————
let installedApps = [];
let openApps = [];

// —————— Persistence & Theme ——————
function loadInstalledApps() {
  return new Promise(resolve => {
    const stored = localStorage.getItem("installedApps");
    installedApps = stored ? JSON.parse(stored) : [];
    resolve();
  });
}
function saveInstalledApps() {
  localStorage.setItem("installedApps", JSON.stringify(installedApps));
}
function saveOSTheme(osName) {
  localStorage.setItem("osTheme", osName);
}
function restoreOSTheme() {
  const theme = localStorage.getItem("osTheme");
  if (theme) changeOS(theme);
}
function changeOS(osName) {
  saveOSTheme(osName);
  const link = document.querySelector('link[rel="stylesheet"]');
  const btn  = document.getElementById("start-button");
  if (!link || !btn) return;
  if (osName === "default") {
    link.href = "assets/css/default.css";
    btn.innerHTML = "❖";
  } else {
    link.href = `assets/css/${osName}.css`;
    btn.innerHTML = `<img src="images/icons/${osName}/start.png" onerror="this.onerror=null;this.src='/images/icons/${osName}/start.jpg'" alt="Start">`;
  }
}

// —————— Desktop & Taskbar ——————
function renderDesktop() {
  // TODO: clear existing icons & create one per installedApps[]
}
function updateTaskbar() {
  // TODO: reflect openApps[] as taskbar buttons
}

// —————— Window Management ——————
function makeDraggable(el) { /* ... */ }
function makeResizable(el) { /* ... */ }

function openPage(name, icon, url) {
  const id = name.toLowerCase().replace(/\s+/g, '-') + '-page';
  if (document.getElementById(id)) return;
  openApps.push(id);
  updateTaskbar();

  const win = document.createElement("div");
  win.className = "app-window";
  win.id = id;
  win.innerHTML = `
    <div class="window-header">
      <img class="window-icon" src="${icon}" alt="${name}" />
      <span class="window-title">${name}</span>
      <button class="window-btn" onclick="closePage('${id}')">
        <img src="images/icons/x.png" alt="Close" />
      </button>
    </div>
    <div class="window-content">
      <iframe src="${url}" style="border:none;width:100%;height:100%;"></iframe>
    </div>
    <div class="resize-handle"></div>
  `;
  document.body.appendChild(win);
  makeDraggable(win);
  makeResizable(win);
}

function closePage(pageId) {
  const win = document.getElementById(pageId);
  if (win) win.remove();
  openApps = openApps.filter(id => id !== pageId);
  updateTaskbar();
}

// —————— App Installation ——————
function installApp(name, icon, url) {
  installedApps.push({ name, icon, url, htmlContent: "" });
  saveInstalledApps();
}

function installJstoreIfNotInstalled() {
  if (!installedApps.some(a => a.name === "Jstore")) {
    installApp("Jstore", "apps/icons/jstore.png", "");
    const j = installedApps.find(a => a.name === "Jstore");
    j.htmlContent = `
      <div id="jstore-container">
        <h1>Jstore</h1>
        <input type="text" id="jstore-search" placeholder="Search apps..." oninput="filterJstoreApps(this.value)" />
        <div id="jstore-app-list"></div>
      </div>
    `;
    saveInstalledApps();
  }
}

function installSettingsIfNotInstalled() {
  if (!installedApps.some(a => a.name === "Settings")) {
    installApp("Settings", "apps/icons/settings.png", "");
    const s = installedApps.find(a => a.name === "Settings");
    s.htmlContent = `
      <div id="settings-app">
        <aside id="settings-sidebar">
          <input type="text" id="settings-search" placeholder="Search settings..." />
          <ul id="settings-options">
            <li data-tab="personalization">
              <img src="https://jxoj.github.io/Jxo-OS/images/icons/settings/sidebar/personalization.webp" alt="Personalization" />
              <span>Personalization</span>
            </li>
            <li data-tab="account">
              <img src="https://jxoj.github.io/Jxo-OS/images/icons/settings/sidebar/account.webp" alt="Account" />
              <span>Account</span>
            </li>
            <li data-tab="android-subsystem">
              <img src="images/icons/subsystem/android/android_background.png" alt="Android Subsystem" />
              <span>Android Subsystem</span>
            </li>
          </ul>
        </aside>
        <section id="settings-content"></section>
      </div>
    `;
    saveInstalledApps();
  }
}

// —————— Settings App Logic ——————
function initSettingsApp() {
  const search = document.getElementById("settings-search");
  const opts   = document.getElementById("settings-options");
  if (search && opts) {
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      opts.querySelectorAll("li").forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }
  document.querySelectorAll("#settings-options li").forEach(li => {
    li.onclick = () => {
      document.querySelectorAll("#settings-options li").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      switch (li.dataset.tab) {
        case "personalization": loadPersonalizationTab(); break;
        case "account":         loadAccountTab();         break;
        case "android-subsystem": loadAndroidSubsystemTab(); break;
      }
    };
  });
  loadPersonalizationTab();
}

function loadPersonalizationTab() {
  document.getElementById("settings-content").innerHTML = `<h2>Personalization</h2>`;
}
function loadAccountTab() {
  document.getElementById("settings-content").innerHTML = `<h2>Account</h2>`;
}
function loadAndroidSubsystemTab() {
  document.getElementById("settings-content").innerHTML = `
    <h2>Android Subsystem</h2>
    <div style="background:#333;padding:20px;border-radius:8px;max-width:400px;">
      <button onclick="openPage(
        'Android Subsystem Installer',
        'https://jxoj.github.io/Jxo-OS/images/icons/subsystem/android.png',
        'https://jxoj.github.io/Jxo-OS/assets/subsystem/android/installer'
      )">Install Android Subsystem</button>
      <button style="margin-left:10px;" onclick="openPage(
        'Android Subsystem Installer',
        'https://jxoj.github.io/Jxo-OS/images/icons/subsystem/android.png',
        'https://jxoj.github.io/Jxo-OS/assets/subsystem/android/uninstaller'
      )">Uninstall Android Subsystem</button>
    </div>
  `;
}

// —————— Iframe Communication ——————
window.addEventListener('message', e => {
  const msg = e.data;
  if (!msg?.jxos) return;

  const { type, payload } = msg;
  switch (type) {
    case 'installApp':
      installApp(payload.name, payload.icon, payload.url);
      renderDesktop();
      break;
    case 'uninstallApp':
      installedApps = installedApps.filter(a => a.name !== payload.name);
      saveInstalledApps();
      renderDesktop();
      break;
    case 'openPage':
      openPage(payload.name, payload.icon, payload.url);
      break;
    case 'closePage':
      const pageId = payload.name.toLowerCase().replace(/\s+/g, '-') + '-page';
      closePage(pageId);
      break;
    case 'changeOS':
      changeOS(payload.osName);
      break;
    case 'getInstalledApps':
      e.source.postMessage({
        jxos: true,
        type: 'getInstalledAppsEvent',
        payload: installedApps
      }, '*');
      break;
    case 'getOpenApps':
      e.source.postMessage({
        jxos: true,
        type: 'getOpenAppsEvent',
        payload: openApps
      }, '*');
      break;
    default:
      console.warn('Unknown JxOS message:', type);
  }
});
