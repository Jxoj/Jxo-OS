// api.js

const JxoOS = (() => {
  function _send(type, payload = {}) {
    parent.postMessage({ jxos: true, type, payload }, '*');
  }

  return {
    // === App lifecycle ===
    installApp(name, icon, url) {
      _send('installApp', { name, icon, url });
    },
    uninstallApp(name) {
      _send('uninstallApp', { name });
    },
    openPage(name, icon, url) {
      _send('openPage', { name, icon, url });
    },
    closePage(name) {
      _send('closePage', { name });
    },

    // === Theming ===
    changeTheme(osName) {
      _send('changeOS', { osName });
    },

    // === State queries (async via events) ===
    getInstalledApps(callback) {
      function handler(e) {
        const msg = e.data;
        if (msg?.jxos && msg.type === 'getInstalledAppsEvent') {
          window.removeEventListener('message', handler);
          callback(msg.payload);
        }
      }
      window.addEventListener('message', handler);
      _send('getInstalledApps');
    },
    getOpenApps(callback) {
      function handler(e) {
        const msg = e.data;
        if (msg?.jxos && msg.type === 'getOpenAppsEvent') {
          window.removeEventListener('message', handler);
          callback(msg.payload);
        }
      }
      window.addEventListener('message', handler);
      _send('getOpenApps');
    },

    // === Events from OS ===
    on(event, handler) {
      window.addEventListener('message', e => {
        const msg = e.data;
        if (msg?.jxos && msg.type === `${event}Event`) {
          handler(msg.payload);
        }
      });
    }
  };
})();

// Expose globally in the iframe
window.JxoOS = JxoOS;
