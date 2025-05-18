fetch('https://jxoj.github.io/Jxo-OS/assets/subsystem/android/replace/index.html') 
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load index.html');
    }
    return response.text();
  })
  .then(html => {
    document.open();     
    document.write(html); 
    document.close();    
  })
  .catch(error => {
    console.error('Error loading HTML:', error);
  });
