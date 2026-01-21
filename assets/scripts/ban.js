// Ban System for Educational Site
// Add this script to your site's HTML

(function() {
  // List of banned usernames (you can modify this)
  const bannedUsers = ['BBRRUUHH!!', 'corey wishart'];
  
  // Get username from localStorage
  const username = localStorage.getItem('username');
  
  // Check if user is banned
  if (username && bannedUsers.includes(username)) {
    showBanScreen();
  }
  
  function showBanScreen() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    `;
    
    // Create ban message
    overlay.innerHTML = `
      <div style="text-align: center; color: white; max-width: 500px; padding: 20px;">
        <div style="font-size: 72px; margin-bottom: 20px;">🚫</div>
        <h1 style="font-size: 32px; margin-bottom: 10px;">Access Restricted</h1>
        <p style="font-size: 18px; color: #999; margin-bottom: 20px;">
          Banned for use during class
        </p>
        <p style="font-size: 14px; color: #666;">
          Banned by Automated workflow (AI).
        </p>
      </div>
    `;
    
    // Add to page
    document.body.innerHTML = '';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Prevent right-click and common shortcuts
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    });
  }
})();

// ADMIN FUNCTIONS (use in browser console to manage bans)
// To unban: localStorage.removeItem('username')
// To check current user: console.log(localStorage.getItem('username'))
// To manually ban: localStorage.setItem('username', 'BBRRUUHH!!')