window.addEventListener('message', function(event) {
    const data = event.data;

    // Make sure to handle messages from any origin
    if (data && data.type) {
        if (data.type === 'installApp') {
            // Clean up parameters by removing the quotes
            const [name, icon, url] = data.data.map(arg => arg.replace(/"/g, ''));
            installApp(name, icon, url);  // Call installApp with cleaned parameters
        }

        if (data.type === 'uninstallApp') {
            // Clean up parameters by removing the quotes
            const [name] = data.data.map(arg => arg.replace(/"/g, ''));
            uninstallApp(name);  // Call uninstallApp with cleaned parameter
        }
    } else {
        console.error("Received invalid message data");
    }
});

// Install app function
function installApp(name, icon, url) {
    console.log(`Installing App: Name: ${name}, Icon: ${icon}, URL: ${url}`);
}

// Uninstall app function
function uninstallApp(name) {
    console.log(`Uninstalling App: Name: ${name}`);
}
