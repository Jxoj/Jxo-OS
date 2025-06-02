
window.jxoos = new Proxy({}, {
  get: (_, fn) => {
    return (...args) => {
      try {
        if (parent && typeof parent.jxoos?.[fn] === "function") {
          return parent.jxoos[fn](...args);
        } else {
          console.warn(`Function "${fn}" is not available in parent.`);
        }
      } catch (e) {
        console.error(`Error calling parent function "${fn}":`, e);
      }
    };
  }
});
