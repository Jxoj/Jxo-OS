window.addEventListener('message', function(event) {
    // Security check to ensure the message is from the correct origin
    if (event.origin !== 'https://your-iframe-origin.com') {
        return; // Ensure you're accepting messages only from the expected iframe source
    }

    const message = event.data;

    if (message.type === 'installApp') {
        // Execute the installApp function with the parameters
        installApp(message.name, message.icon, message.url);
    } else if (message.type === 'uninstallApp') {
        // Execute the uninstallApp function with the parameters
        uninstallApp(message.name);
    }
});