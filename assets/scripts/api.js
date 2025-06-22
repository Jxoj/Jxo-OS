// api.js — JXO-OS remote API bridge
window.jxoos = new Proxy({}, {
  get(_, fnName) {
    return (...args) => new Promise((resolve, reject) => {
      const id = Math.random().toString(36).slice(2);
      const handler = (event) => {
        const d = event.data;
        if (d && d.type === "jxo-api-response" && d.id === id) {
          window.removeEventListener("message", handler);
          if (d.success) resolve(d.result);
          else reject(new Error(d.error));
        }
      };
      window.addEventListener("message", handler);
      parent.postMessage({ id, type: "jxo-api-call", fn: fnName, args }, "*");
    });
  }
});
