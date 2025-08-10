const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const net = require('net');

// Keep a reference to the main window and the server process
let mainWindow;
let serverProcess;

// Function to check if port is available
function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
}

// Function to find an available port
async function findAvailablePort(startPort = 3000) {
    for (let port = startPort; port < startPort + 100; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    return null;
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Show DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Check port availability and start server
    async function startServer() {
        try {
            const availablePort = await findAvailablePort(3000);
            
            if (!availablePort) {
                throw new Error('No available ports found');
            }

            console.log(`Starting server on port ${availablePort}`);
            
            // Start the Node.js server with custom port
            serverProcess = fork(path.join(__dirname, 'app.js'), [availablePort.toString()], {
                env: { ...process.env, PORT: availablePort.toString() }
            });

            serverProcess.on('error', (error) => {
                console.error('Server process error:', error);
                showError(`Server failed to start: ${error.message}`);
            });

            serverProcess.on('exit', (code) => {
                console.log(`Server process exited with code: ${code}`);
                if (code !== 0) {
                    showError(`Server process exited with code: ${code}`);
                }
            });

            // Wait for server to be ready
            setTimeout(() => {
                mainWindow.loadURL(`http://localhost:${availablePort}`).catch((error) => {
                    console.error(`Failed to load localhost:${availablePort}:`, error);
                    showError(`Could not connect to server on port ${availablePort}<br>Error: ${error.message}`);
                });
            }, 2000);

        } catch (error) {
            console.error('Failed to start server:', error);
            showError(`Failed to start server: ${error.message}`);
        }
    }

    function showError(message) {
        const errorHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error - She Fashion House</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 40px; 
                        background: #f5f5f5; 
                        text-align: center; 
                    }
                    .error-box { 
                        background: white; 
                        padding: 30px; 
                        border-radius: 10px; 
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                        max-width: 500px; 
                        margin: 0 auto; 
                    }
                    .error-icon { font-size: 48px; margin-bottom: 20px; }
                    .retry-btn { 
                        background: #007bff; 
                        color: white; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        margin-top: 20px; 
                    }
                </style>
            </head>
            <body>
                <div class="error-box">
                    <div class="error-icon">⚠️</div>
                    <h2>Application Error</h2>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                </div>
            </body>
            </html>
        `;
        mainWindow.loadURL(`data:text/html,${encodeURIComponent(errorHTML)}`);
    }

    // Start the server
    startServer();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization.
app.on('ready', createWindow);

// Quit when all windows are closed, and kill the server process.
app.on('window-all-closed', () => {
    console.log('All windows closed. Killing server process.');
    // Kill the server process when the app is closed
    if (serverProcess) {
        serverProcess.kill();
    }
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});