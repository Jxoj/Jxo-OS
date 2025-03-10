(function() {
    // Get URL parameters using URLSearchParams
    const params = new URLSearchParams(window.location.search);
  
    // If the URL contains the installApp parameter,
    // expected format: ?installApp=(name),(imageurl),(url)
    if (params.has('installApp')) {
      const value = params.get('installApp');
      const parts = value.split(',');
  
      if (parts.length === 3) {
        // Trim each part to remove extra whitespace, but keep the parentheses intact.
        const name = parts[0].trim();
        const imageUrl = parts[1].trim();
        const url = parts[2].trim();
  
        // Call the installApp function exactly as: installApp("(name)","(imageurl)","(url)")
        installApp(name, imageUrl, url);
      }
    }
  
    // If the URL contains the unistallApp parameter,
    // expected format: ?unistallApp=(name)
    if (params.has('unistallApp')) {
      const name = params.get('unistallApp').trim();
      // Call the unistallApp function exactly as: unistallApp("(name)")
      unistallApp(name);
    }
  })();
  