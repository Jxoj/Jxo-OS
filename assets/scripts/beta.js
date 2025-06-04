

// Clear sessionStorage so login UI shows on every reload.
document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.removeItem("loggedIn");
  });
  
  // Global variables for installed and open apps.
  let installedApps = [];
  let openApps = [];
  
  // Load installed apps from localStorage.
  function loadInstalledApps() {
    return new Promise((resolve) => {
      const stored = localStorage.getItem("installedApps");
      installedApps = stored ? JSON.parse(stored) : [];
      resolve();
    });
  }
  
  // Save OS theme to localStorage.
  function saveOSTheme(osName) {
    localStorage.setItem("osTheme", osName);
  }
  
  // Change OS theme, save it, and update the stylesheet.
  function changeOS(osName) {
    saveOSTheme(osName);
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    const startBtn = document.getElementById("start-button");
    if (!stylesheet || !startBtn) return;
    if (osName === "default") {
      stylesheet.href = "assets/css/default.css";
      startBtn.innerHTML = "❖";
    } else {
      stylesheet.href = `assets/css/${osName}.css`;
      startBtn.innerHTML = `<img src="images/icons/${osName}/start.png" onerror="this.onerror=null; this.src='/images/icons/${osName}/start.jpg'" alt="Start">`;
    }
  }
  
  // Restore OS theme on load.
  function restoreOSTheme() {
    const savedOS = localStorage.getItem("osTheme");
    if (savedOS) changeOS(savedOS);
  }
  
  // Install Jstore if not installed.
  function installJstoreIfNotInstalled() {
    if (!installedApps.some(a => a.name === "Jstore")) {
      installApp("Jstore", "apps/icons/jstore.png", "");
      const app = installedApps.find(a => a.name === "Jstore");
      if (app) {
        app.htmlContent = `
          <div id="jstore-container">
            <h1>Jstore</h1>
            <input type="text" id="jstore-search" placeholder="Search apps..." oninput="filterJstoreApps(this.value)">
            <div id="jstore-app-list"></div>
          </div>
        `;
        localStorage.setItem("installedApps", JSON.stringify(installedApps));
      }
    }
  }
  
  // Install Settings app if not installed.
  function installSettingsIfNotInstalled() {
  if (!installedApps.some(a => a.name === "Settings")) {
    installApp("Settings", "apps/icons/settings.png", "");
    const app = installedApps.find(a => a.name === "Settings");
    if (app) {
      app.htmlContent = `
        <div id="settings-app">
          <div id="settings-sidebar">
            <input type="text" id="settings-search" placeholder="Search settings...">
            <ul id="settings-options">
              <li data-tab="personalization">
                <img src="https://jxoj.github.io/Jxo-OS/images/icons/settings/sidebar/personalization.webp" alt="Personalization">
                <span>Personalization</span>
              </li>
              <li data-tab="account">
                <img src="https://jxoj.github.io/Jxo-OS/images/icons/settings/sidebar/account.webp" alt="Account">
                <span>Account</span>
              </li>
              <li data-tab="about">
                <img src="https://jxoj.github.io/Jxo-OS/images/icons/settings/sidebar/about.png" alt="About System">
                <span>About System</span>
              </li>
            </ul>
          </div>
          <div id="settings-content"></div>
        </div>
      `;
      localStorage.setItem("installedApps", JSON.stringify(installedApps));
    }
  }
}

  
  // Fetch and render Jstore apps.
  function loadJstoreApps() {
    fetch("https://jxoj.github.io/Jxo-OS/apps/apps.json")
      .then(res => res.ok ? res.json() : Promise.reject("Network error"))
      .then(apps => {
        const list = document.getElementById("jstore-app-list");
        if (!list) return;
        list.innerHTML = "";
        apps.forEach(app => {
          const isInst = installedApps.some(a => a.name === app.name);
          const btn = document.createElement("button");
          btn.dataset.icon = app.icon;
          btn.dataset.url = app.url;
          btn.textContent = isInst ? "Uninstall" : "Install";
          btn.onclick = () => {
            if (isInst) uninstallJstoreApp(app.name, btn);
            else installJstoreApp(app.name, app.icon, app.url, btn);
          };
          const div = document.createElement("div");
          div.className = "jstore-app-item";
          div.innerHTML = `<img src="${app.icon}" alt="${app.name}"><span>${app.name}</span>`;
          div.appendChild(btn);
          list.appendChild(div);
        });
      })
      .catch(err => {
        console.error("Failed to load Jstore apps:", err);
        const list = document.getElementById("jstore-app-list");
        if (list) list.innerHTML = "<p>Error loading apps.</p>";
      });
  }
  
  // Install/uninstall handlers for Jstore apps.
  function installJstoreApp(name, icon, url, btn) {
    installApp(name, icon, url);
    btn.textContent = "Uninstall";
    btn.onclick = () => uninstallJstoreApp(name, btn);
  }
  function uninstallJstoreApp(name, btn) {
    uninstallApp(name);
    btn.textContent = "Install";
    btn.onclick = () => installJstoreApp(name, btn.dataset.icon, btn.dataset.url, btn);
  }
  
  // Filter Jstore list by query.
  function filterJstoreApps(query) {
    document.querySelectorAll('.jstore-app-item').forEach(item => {
      const name = item.querySelector('span').textContent.toLowerCase();
      item.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
  }
  
  // Core install/uninstall logic.
  function installApp(name, icon, url) {
    installedApps.push({ name, appId: name.toLowerCase().replace(/\s+/g, ""), image: icon, htmlUrl: url });
    localStorage.setItem("installedApps", JSON.stringify(installedApps));
    renderDesktop();
  }
  function uninstallApp(name) {
    installedApps = installedApps.filter(a => a.name.toLowerCase() !== name.toLowerCase());
    localStorage.setItem("installedApps", JSON.stringify(installedApps));
    renderDesktop();
  }
  
function initSettingsApp() {
  const search = document.getElementById("settings-search");
  const options = document.getElementById("settings-options");
  const items = document.querySelectorAll("#settings-options li");

  // If not ready, retry shortly
  if (!search || !options || items.length === 0) {
    setTimeout(initSettingsApp, 100);
    return;
  }

  // Add search filter
  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    options.querySelectorAll("li").forEach(li => {
      li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  // Add tab switcher
  items.forEach(item => {
    item.onclick = () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      switch (item.dataset.tab) {
        case "personalization":
          loadPersonalizationTab();
          break;
        case "account":
          loadAccountTab();
          break;
        case "about":
          loadAboutSystemTab();
          break;
      }
    };
  });

  // Load default tab
  loadPersonalizationTab();
}

  
  // Personalization tab UI.
  function loadPersonalizationTab() {
    const container = document.getElementById("settings-content");
    if (!container) return;
    const wallpapers = Array.from({ length: 41 }, (_, i) => `images/backgrounds/wallpaper${i+1}.jpg`);
    const osOptions = ["default", "windows10"];
    container.innerHTML = `
      <h2>Personalization</h2>
      <div><h3>Change OS Theme</h3><select id="os-dropdown">${osOptions.map(o=>`<option value="${o}">${o}</option>`).join('')}</select></div>
      <div><h3>Change Background Image</h3><div id="bg-preview-container"><img id="bg-preview" src="${wallpapers[0]}" alt="Preview"></div><select id="wallpaper-dropdown">${wallpapers.map(w=>`<option value="${w}">${w.split('/').pop()}</option>`).join('')}</select></div>
      <div><h3>Change Background Color</h3><input type="color" id="bg-color-picker"></div>
      <div><h3>Toggle Light/Dark Mode</h3><select id="mode-toggle"><option value="dark">Dark Mode</option><option value="light">Light Mode</option></select></div>
    `;
    const osDd = document.getElementById("os-dropdown");
    osDd.value = localStorage.getItem("osTheme") || "default";
    osDd.onchange = () => changeOS(osDd.value);
  
    const wpDd = document.getElementById("wallpaper-dropdown");
    const bgPrev = document.getElementById("bg-preview");
    wpDd.onchange = () => {
      bgPrev.src = wpDd.value;
      changeBackgroundImage(wpDd.value);
    };
  
    document.getElementById("bg-color-picker").oninput = e => {
      const hex = e.target.value;
      const r = parseInt(hex.slice(1,3),16),
            g = parseInt(hex.slice(3,5),16),
            b = parseInt(hex.slice(5,7),16);
      changeBackground(r,g,b);
    };
  
    const modeSel = document.getElementById("mode-toggle");
    modeSel.value = localStorage.getItem("mode") || "dark";
    modeSel.onchange = () => toggleLightDark(modeSel.value);
    toggleLightDark(modeSel.value);
  }
  
  // Account tab UI.
  function loadAccountTab() {
    const container = document.getElementById("settings-content");
    if (!container) return;
    container.innerHTML = `
      <h2>Account</h2>
      <div style="background:#333;padding:20px;border-radius:8px;max-width:400px;">
        <label>New Username:</label>
        <input type="text" id="new-username" placeholder="Enter new username">
        <label>New Password:</label>
        <div style="display:inline-flex;align-items:center;">
          <input type="password" id="new-password" placeholder="Enter new password">
          <button class="toggle-password" onclick="toggleInputPassword('new-password', this)"><img src="images/icons/setup/show.png" alt="Show"></button>
        </div>
        <button onclick="updateAccount()">Update Account</button>
        <div id="account-message" style="margin-top:10px;"></div>
      </div>
    `;
  }
  
  // Toggle input type for passwords.
  function toggleInputPassword(id, btn) {
    const inp = document.getElementById(id);
    if (!inp) return;
    if (inp.type === "password") {
      inp.type = "text";
      btn.innerHTML = `<img src="images/icons/setup/hide.png" alt="Hide">`;
    } else {
      inp.type = "password";
      btn.innerHTML = `<img src="images/icons/setup/show.png" alt="Show">`;
    }
  }
  
  // Account update logic.
  function updateAccount() {
    const u = document.getElementById("new-username").value;
    const p = document.getElementById("new-password").value;
    if (u) localStorage.setItem("username", u);
    if (p) localStorage.setItem("password", p);
    document.getElementById("account-message").innerText = "Account updated successfully!";
  }
  
  // Show password modal on lock or boot.
  function showPasswordModal() {
    const hasPass = !!localStorage.getItem("password");
    const pic = localStorage.getItem("profilePic") || "images/icons/profile/profile.png";
    const modal = document.createElement("div");
    modal.className = "password-modal";
    let inner = `<div class="password-modal-content"><img src="${pic}" alt="Profile">`;
    if (hasPass) {
      const user = localStorage.getItem("username");
      inner += user ? `<p>Welcome, ${user}!</p>` : `<input type="text" id="username-input" placeholder="Enter your username"><br>`;
      inner += `<h3>Enter Password</h3><div style="display:inline-flex;align-items:center;"><input type="password" id="entered-password"><button class="toggle-password" onclick="toggleInputPassword('entered-password', this)"><img src="images/icons/setup/show.png"></button></div><br><button onclick="checkPassword()">Enter</button>`;
    } else {
      inner += `<h3>Set up your account</h3><input type="text" id="username-input" placeholder="Username"><br><input type="password" id="new-password" placeholder="Password"><br><button onclick="setCredentials()">Set Credentials</button>`;
    }
    inner += `</div>`;
    modal.innerHTML = inner;
    document.body.appendChild(modal);
  }
  
  // Check entered password.
  function checkPassword() {
    const entered = document.getElementById("entered-password").value;
    if (entered === localStorage.getItem("password")) {
      document.querySelector(".password-modal").remove();
    } else {
      alert("Incorrect password!");
    }
  }
  
  // Set new credentials.
  function setCredentials() {
    const u = document.getElementById("username-input").value;
    const p = document.getElementById("new-password").value;
    if (u && p) {
      localStorage.setItem("username", u);
      localStorage.setItem("password", p);
      document.querySelector(".password-modal").remove();
    } else {
      alert("Both fields are required!");
    }
  }
  
  // Toggle light/dark mode.
  function toggleLightDark(mode) {
    localStorage.setItem("mode", mode);
    const body = document.body;
    const taskbarEl = document.getElementById("taskbar");
    if (mode === "light") {
      body.style.color = "#000";
      body.style.backgroundColor = "#f0f0f0";
      if (taskbarEl) taskbarEl.style.backgroundColor = "#e0e0e0";
    } else {
      body.style.color = "#e0e0e0";
      body.style.backgroundColor = "#121212";
      if (taskbarEl) taskbarEl.style.backgroundColor = "#1f1f1f";
    }
  }
  
  // Change RGB background.
  function changeBackground(r, g, b) {
    const col = `rgb(${r},${g},${b})`;
    document.body.style.background = col;
    localStorage.setItem("background", col);
  }
  
  // Change background image.
  function changeBackgroundImage(url) {
    const bg = `url(${url}) center/cover no-repeat fixed`;
    document.body.style.background = bg;
    localStorage.setItem("background", bg);
  }
  
  // Load stored background on OS load.
  function loadBackground() {
    const bg = localStorage.getItem("background");
    if (bg) document.body.style.background = bg;
  }
  
function showBootScreen() {
  document.body.innerHTML = `
  <div class="boot-screen" style="width:100vw; height:100vh; background:blue; display:flex; justify-content:center; align-items:center;">
    <div class="boot-content" style="text-align:center;">
      <span style="font-size:32px; font-family:sans-serif; color:white;">Jx</span>
      <div style="
        display:inline-block;
        vertical-align:middle;
        margin-left:-0.1em;
        position:relative;
        top:-0.1em;
        width:0.7em;
        height:0.7em;
        border:2px solid white;
        border-top:2px solid transparent;
        border-radius:50%;
        animation:spin 1s linear infinite;
      "></div>
    </div>
  </div>

  <style>
    @keyframes spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;



    setTimeout(() => {
      loadOS();
      if (localStorage.getItem("setupComplete")) setTimeout(showPasswordModal, 500);
    }, 2000);
  }





  
  // Render desktop icons.
  function renderDesktop() {
    const desk = document.getElementById("desktop");
    if (!desk) return;
    desk.innerHTML = "";
    installedApps.forEach(app => {
      const el = document.createElement("div");
      el.className = "desktop-app";
      el.innerHTML = `<img src="${app.image}" alt="${app.name}"><span>${app.name}</span>`;
      el.onclick = () => openAppWindow(app.appId);
      desk.appendChild(el);
    });
  }
  
  // Open an app window.
  function openAppWindow(appId) {
    const app = installedApps.find(a => a.appId === appId);
    if (!app || document.getElementById(appId)) return;
    const win = document.createElement("div");
    win.className = "app-window";
    win.id = appId;
    win.innerHTML = `
      <div class="window-header"><span class="window-title">${app.name}</span>
        <div>
          <button class="window-btn" onclick="closeWindow('${appId}')"><img src="images/icons/x.png" alt="Close"></button>
          <button class="window-btn" onclick="toggleFullscreen('${appId}')"><img src="images/icons/fullscreen.png" alt="FS"></button>
        </div>
      </div>
      <div class="window-content">${app.htmlContent || `<iframe src="${app.htmlUrl}" style="border:none;width:100%;height:100%;"></iframe>`}</div>
      <div class="resize-handle"></div>`;
    document.body.appendChild(win);
    makeDraggable(win);
    makeResizable(win);
    openApps.push(appId);
    updateTaskbar();
    if (appId === "jstore") setTimeout(loadJstoreApps, 100);
    if (appId === "settings") setTimeout(initSettingsApp, 100);
  }
  
  // Close an app window.
  function closeWindow(appId) {
    const win = document.getElementById(appId);
    if (win) win.remove();
    openApps = openApps.filter(id => id !== appId);
    updateTaskbar();
  }
  
  // Toggle fullscreen for a window.
  function toggleFullscreen(appId) {
    const win = document.getElementById(appId);
    if (!win) return;
    if (win.style.position === "fixed") {
      win.style.position = "absolute";
      win.style.width = "600px";
      win.style.height = "400px";
      win.style.top = "";
      win.style.left = "";
      win.style.zIndex = "";
    } else {
      win.style.position = "fixed";
      win.style.top = "0";
      win.style.left = "0";
      win.style.width = "100%";
      win.style.height = `calc(100% - ${document.getElementById("taskbar").offsetHeight}px)`;
      win.style.zIndex = "999";
    }
  }
  
  // Make a window draggable.
  function makeDraggable(win) {
    const header = win.querySelector(".window-header");
    let offsetX, offsetY, dragging = false;
    header.addEventListener("mousedown", e => {
      dragging = true;
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;
      win.style.userSelect = "none";
    });
    document.addEventListener("mousemove", e => {
      if (dragging) {
        win.style.left = `${e.clientX - offsetX}px`;
        win.style.top = `${e.clientY - offsetY}px`;
      }
    });
    document.addEventListener("mouseup", () => {
      dragging = false;
      win.style.userSelect = "";
    });
  }
  
  // Make a window resizable.
  function makeResizable(win) {
    const handle = win.querySelector(".resize-handle");
    let startX, startY, startW, startH, resizing = false;
    handle.addEventListener("mousedown", e => {
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = win.offsetWidth;
      startH = win.offsetHeight;
      win.style.userSelect = "none";
      e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (resizing) {
        win.style.width = `${startW + (e.clientX - startX)}px`;
        win.style.height = `${startH + (e.clientY - startY)}px`;
      }
    });
    document.addEventListener("mouseup", () => {
      resizing = false;
      win.style.userSelect = "";
    });
  }
  
  // Update clock display.
  function updateClock() {
    const now = new Date();
    document.getElementById("clock").innerText = now.toLocaleTimeString();
    document.getElementById("date").innerText = now.toLocaleDateString();
  }
  
  // Toggle search menu.
  function toggleSearchMenu() {
    const menu = document.getElementById("search-menu");
    if (menu.style.display === "none" || menu.style.display === "") {
      filterApps("");
      menu.style.display = "block";
    } else {
      menu.style.display = "none";
    }
  }
  
  // Search apps in start menu.
  function filterApps(query) {
    const appList = document.getElementById("app-list");
    appList.innerHTML = "";
    let apps = installedApps.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (query) {
      apps = apps.filter(app => app.name.toLowerCase().includes(query.toLowerCase()));
    }
    apps.forEach(app => {
      const item = document.createElement("div");
      item.className = "app-item";
      item.innerHTML = `<img src="${app.image}" alt="${app.name}"><span>${app.name}</span>`;
      item.onclick = () => { openAppWindow(app.appId); toggleSearchMenu(); };
      appList.appendChild(item);
    });
  }
  
  // Update taskbar.
  function updateTaskbar() {
    const openContainer = document.getElementById("open-apps");
    openContainer.innerHTML = "";
    openApps.forEach(appId => {
      const app = installedApps.find(a => a.appId === appId);
      if (app) {
        const icon = document.createElement("img");
        icon.src = app.image;
        icon.alt = app.name;
        icon.title = app.name;
        icon.onclick = () => bringToFront(appId);
        openContainer.appendChild(icon);
      }
    });
  }
  
  // Bring a window to front.
  function bringToFront(appId) {
    const win = document.getElementById(appId);
    if (win) document.body.appendChild(win);
  }
  
  // Power Down.
  function powerOff() {
    document.body.innerHTML = `
      <div class="shutdown-screen">
        <h2>Shutting down...</h2>
        <p>Goodbye!</p>
        <button onclick="location.reload()">Reboot</button>
      </div>
    `;
  }
  
  // Multi-step Setup Screen.
  function showSetupScreen() {
    const container = document.createElement("div");
    container.className = "setup-screen";
    document.body.appendChild(container);
    let currentStep = 1;
    const data = { username: "", password: "", profilePic: "", wallpaper: "", osTheme: "", colorScheme: "" };
  
    function renderStep() {
      switch (currentStep) {
        case 1:
          container.innerHTML = `
            <div class="setup-step">
              <h2>Let's get you setup</h2>
              <p>Please choose your username and password.</p>
              <input type="text" id="setup-username" placeholder="Username" />
              <div>
                <input type="password" id="setup-password" placeholder="Password" />
                <button class="toggle-password" onclick="toggleInputPassword('setup-password', this)">
                  <img src="images/icons/setup/show.png" alt="Show" />
                </button>
              </div>
              <button id="setup-next">Next</button>
            </div>
          `;
          document.getElementById("setup-next").onclick = () => {
            const u = document.getElementById("setup-username").value.trim();
            const p = document.getElementById("setup-password").value.trim();
            if (u && p) {
              data.username = u;
              data.password = p;
              currentStep++;
              renderStep();
            } else alert("Username and password cannot be empty!");
          };
          break;
  
        case 2:
          container.innerHTML = `
            <div class="setup-step">
              <h2>Choose a Profile Picture</h2>
              <p>This is optional. Upload one if you like:</p>
              <div class="file-input-wrapper">
                <span class="file-input-label">Choose File</span>
                <input type="file" id="profile-upload" accept="image/*" />
              </div>
              <img id="profile-preview" class="preview-img" src="images/icons/profile/profile.png" alt="Profile Preview">
              <br>
              <button id="setup-skip">Skip</button>
              <button id="setup-next">Next</button>
            </div>
          `;
          document.getElementById("profile-upload").onchange = e => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = evt => {
                document.getElementById("profile-preview").src = evt.target.result;
                data.profilePic = evt.target.result;
              };
              reader.readAsDataURL(file);
            }
          };
          document.getElementById("setup-skip").onclick = () => {
            data.profilePic = "images/icons/profile/profile.png";
            currentStep++;
            renderStep();
          };
          document.getElementById("setup-next").onclick = () => {
            if (!data.profilePic) data.profilePic = "images/icons/profile/profile.png";
            currentStep++;
            renderStep();
          };
          break;
  
        case 3:
          container.innerHTML = `
            <div class="setup-step">
              <h2>Choose your Default Wallpaper</h2>
              <p>Select a wallpaper for your desktop.</p>
              <select id="setup-wallpaper-select">
                ${Array.from({length:41},(_,i)=>`<option value="images/backgrounds/wallpaper${i+1}.jpg">Wallpaper ${i+1}</option>`).join('')}
              </select>
              <br>
              <img id="wallpaper-preview" class="preview-img" src="images/backgrounds/wallpaper1.jpg" alt="Wallpaper Preview">
              <br>
              <button id="setup-next">Next</button>
            </div>
          `;
          document.getElementById("setup-wallpaper-select").onchange = e => {
            const sel = e.target.value;
            document.getElementById("wallpaper-preview").src = sel;
            data.wallpaper = sel;
          };
          document.getElementById("setup-next").onclick = () => {
            if (!data.wallpaper) data.wallpaper = document.getElementById("setup-wallpaper-select").value;
            currentStep++;
            renderStep();
          };
          break;
  
        case 4:
          container.innerHTML = `
            <div class="setup-step">
              <h2>Setup OS Theme & Color Scheme</h2>
              <p>Select your OS theme and color scheme.</p>
              <div><label>OS Theme:</label><select id="setup-ostheme"><option value="default">Default</option><option value="windows10">Windows10</option></select></div>
              <div><label>Color Scheme:</label><select id="setup-colorscheme"><option value="dark">Dark</option><option value="light">Light</option></select></div>
              <button id="setup-finish">Finish</button>
            </div>
          `;
          document.getElementById("setup-colorscheme").onchange = function() {
            toggleLightDark(this.value);
          };
          document.getElementById("setup-finish").onclick = () => {
            data.osTheme = document.getElementById("setup-ostheme").value;
            data.colorScheme = document.getElementById("setup-colorscheme").value;
            toggleLightDark(data.colorScheme);
            localStorage.setItem("username", data.username);
            localStorage.setItem("password", data.password);
            localStorage.setItem("profilePic", data.profilePic);
            localStorage.setItem("background", data.wallpaper);
            localStorage.setItem("osTheme", data.osTheme);
            localStorage.setItem("colorScheme", data.colorScheme);
            localStorage.setItem("setupComplete", "true");
            changeBackgroundImage(data.wallpaper);
            sessionStorage.removeItem("loggedIn");
            container.remove();
            showBootScreen();
          };
          break;
      }
    }
  
    renderStep();
  }
  
  // Initial load: setup or boot.
  document.addEventListener("DOMContentLoaded", () => {
    loadInstalledApps().then(() => {
      loadBackground();
      if (!localStorage.getItem("setupComplete")) showSetupScreen();
      else showBootScreen();
    });
  });

window.jxoos = new Proxy({}, {
  get: (_, fn) => {
    if (typeof window[fn] === "function") {
      return (...args) => {
        try {
          return window[fn](...args);
        } catch (e) {
          console.error(`Error calling ${fn}:`, e);
        }
      };
    } else {
      console.warn(`Function "${fn}" is not defined globally.`);
      return () => undefined;
    }
  }
});// Modified loadAboutSystemTab function to detect channel from URL, fetch the appropriate entry from version.json,
// and add a Switch Channel button that toggles between beta and stable pages.

function loadAboutSystemTab() {
  const container = document.getElementById("settings-content");
  if (!container) return;

  // Determine current channel based on URL
  const isBetaChannel = window.location.href.includes("beta");
  const currentChannel = isBetaChannel ? "beta" : "stable";
  const otherChannel = isBetaChannel ? "stable" : "beta";
  const otherChannelUrl = isBetaChannel
    ? "https://jxoj.github.io/Jxo-OS"
    : "https://jxoj.github.io/Jxo-OS/beta.html";

  container.innerHTML = `
    <h2>About System</h2>
    <div id="about-details" style="margin-bottom: 20px; background: #333; padding: 15px; border-radius: 8px;">
      <p>Loading system info...</p>
    </div>
    <button id="toggle-devmode-btn" style="padding: 10px 20px; background: #1e40af; color: #dbeafe; border: none; border-radius: 4px; cursor: pointer;">
      ${localStorage.getItem("devMode") === "true" ? "Disable Dev Mode" : "Enable Dev Mode"}
    </button>
    <button id="switch-channel-btn" style="padding: 10px 20px; margin-left: 10px; background: #047857; color: #d1fae5; border: none; border-radius: 4px; cursor: pointer;">
      Switch to ${otherChannel.charAt(0).toUpperCase() + otherChannel.slice(1)} Channel
    </button>
  `;

  // Fetch version.json and display the entry matching currentChannel
  fetch("https://jxoj.github.io/Jxo-OS/assets/version.json")
    .then(res => {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then(data => {
      const infoDiv = document.getElementById("about-details");
      let entry = null;

      // If version.json is an array, find the object with matching Channel;
      // otherwise, if it's a single object, check its Channel.
      if (Array.isArray(data)) {
        entry = data.find(item => item.Channel.toLowerCase() === currentChannel);
      } else if (data.Channel && data.Channel.toLowerCase() === currentChannel) {
        entry = data;
      }

      if (!entry) {
        // Fallback: if no matching entry, show error message
        infoDiv.innerHTML = `
          <p style="color: #f87171;"><strong>Error:</strong> No version info found for channel "${currentChannel}".</p>
        `;
        return;
      }

      // Display the selected entry
      infoDiv.innerHTML = `
        <p><strong>Name:</strong> ${entry.Name}</p>
        <p><strong>Channel:</strong> ${entry.Channel}</p>
        <p><strong>Ver:</strong> ${entry.Ver}</p>
        <p><strong>Log:</strong> ${entry.Log}</p>
      `;
    })
    .catch(err => {
      const infoDiv = document.getElementById("about-details");
      infoDiv.innerHTML = `<p style="color: red;">Failed to load system info.</p>`;
      console.error("Error fetching version.json:", err);
    });

  // Wire up the Dev Mode toggle button
  const devBtn = document.getElementById("toggle-devmode-btn");
  devBtn.addEventListener("click", () => {
    toggleDevMode();
  });

  // Wire up the Switch Channel button
  const switchBtn = document.getElementById("switch-channel-btn");
  switchBtn.addEventListener("click", () => {
    window.location.href = otherChannelUrl;
  });
}
function toggleDevMode() {
  const currentlyOn = localStorage.getItem("devMode") === "true";
  if (currentlyOn) {
    localStorage.removeItem("devMode");
  } else {
    localStorage.setItem("devMode", "true");
  }
  // Restart the OS (reload the page)
  location.reload();
}
function initDevModeListener() {
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "y" && localStorage.getItem("devMode") === "true") {
      e.preventDefault();
      openPackageImporter();
    }
  });
}
function openPackageImporter() {
  // Create modal container
  const modal = document.createElement("div");
  modal.id = "package-importer-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0, 0, 0, 0.7)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "9999";

  modal.innerHTML = `
    <div style="background: #111827; padding: 20px; border-radius: 8px; width: 400px; color: #dbeafe; text-align: center;">
      <h3>Import Package (ZIP)</h3>
      <input type="file" id="package-zip-input" accept=".zip" style="margin: 20px 0;" />
      <div>
        <button id="close-package-importer" style="padding: 8px 16px; background: #1e40af; color: #dbeafe; border: none; border-radius: 4px; cursor: pointer;">
          Cancel
        </button>
      </div>
      <p style="margin-top: 10px; font-size: 0.9rem; color: #9ca3af;">
        ZIP must contain: <br/>
        • config.jxo <br/>
        • index.html <br/>
        • main.js <br/>
        • main.css
      </p>
    </div>
  `;
showBootScreen
  document.body.appendChild(modal);

  // Close button
  document.getElementById("close-package-importer").onclick = () => {
    modal.remove();
  };

  // Handle file selection
  document.getElementById("package-zip-input").addEventListener("change", async (evt) => {
    const file = evt.target.files[0];
    if (!file) return;

    // Assume JSZip is already loaded on the page
    const arrayBuffer = await file.arrayBuffer();
    JSZip.loadAsync(arrayBuffer).then(async (zip) => {
      try {
        // 1. Read config.jxo
        const configText = await zip.file("config.jxo").async("string");
        const lines = configText.split(/\r?\n/);
        const nameLine = lines.find(l => l.startsWith("Name="));
        const imgLine = lines.find(l => l.startsWith("Image="));
        if (!nameLine || !imgLine) throw new Error("Invalid config.jxo");

        const appName = nameLine.split("=")[1].trim();
        const imgBase64 = imgLine.split("=")[1].trim();

        // 2. Read index.html, main.js, main.css
        const htmlContent = await zip.file("index.html").async("string");
        const jsContent = await zip.file("main.js").async("string");
        const cssContent = await zip.file("main.css").async("string");

        // 3. Build a single HTML blob for the app
        const combinedHTML = `
          <div>
            ${htmlContent}
          </div>
          <style>
            ${cssContent}
          </style>
          <script>
            ${jsContent}
          </script>
        `;

        // 4. Install as a new app
        installApp(appName, `data:image/png;base64,${imgBase64}`, "");
        const newApp = installedApps.find(a => a.name === appName);
        if (newApp) {
          newApp.htmlContent = combinedHTML;
          localStorage.setItem("installedApps", JSON.stringify(installedApps));
          renderDesktop();
        }

        // 5. Cleanup modal
        modal.remove();
      } catch (e) {
        console.error("Failed to import package:", e);
        alert("Import failed: " + e.message);
      }
    }).catch(err => {
      console.error("ZIP parsing error:", err);
      alert("Failed to read ZIP file.");
    });
  });
}
  function loadOS() {
    document.body.innerHTML = `
      <div id="desktop"></div>
      <div id="taskbar" class="taskbar">
        <button id="start-button" onclick="toggleSearchMenu()" class="taskbar-button">❖</button>
        <div id="open-apps"></div>
        <div id="taskbar-right">
          <div id="clock-container"><span id="date"></span> <span id="clock"></span></div>
          <button class="lock-button" onclick="showPasswordModal()">Lock</button>
          <button class="power-button" onclick="powerOff()">Power Down</button>
        </div>
      </div>
      <div id="search-menu" class="search-menu" style="display:none;">
        <span class="close-btn" onclick="toggleSearchMenu()">✕</span>
        <input type="text" placeholder="Search apps..." oninput="filterApps(this.value)">
        <div id="app-list"></div>
      </div>
    `;
    loadInstalledApps().then(() => {
      installJstoreIfNotInstalled();
      installSettingsIfNotInstalled();
      renderDesktop();
      updateTaskbar();
      restoreOSTheme();
      loadBackground();
      initDevModeListener();
      setInterval(updateClock, 1000);
    });
  }