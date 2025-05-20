(async () => {
  const url = 'https://jxoj.github.io/Jxo-OS/assets/subsystem/android/replace/index.html';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const fetchedDoc = parser.parseFromString(htmlText, 'text/html');
    document.head.innerHTML = fetchedDoc.head.innerHTML;
    document.body.innerHTML = fetchedDoc.body.innerHTML;
    if (!document.getElementById('rewardedid')) {
      const div = document.createElement('div');
      div.id = 'rewardedid';
      div.style.display = 'none';  
      document.body.appendChild(div);
    }
    fetchedDoc.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
    });
  } catch (err) {
    console.error('Error loading HTML:', err);
  }
})();
