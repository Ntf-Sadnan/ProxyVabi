// index.js

const http = require('http');
const httpProxy = require('http-proxy');

// --- Configuration ---

// The port this proxy server will listen on. Vercel sets the PORT automatically.
const PORT = process.env.PORT || 8080;

// 1. READ THE TARGET URL FROM VERCEL'S ENVIRONMENT VARIABLES
const TARGET_AWS_BASE_URL = process.env.TARGET_AWS_BASE_URL;

// 2. ADD A CHECK TO ENSURE THE VARIABLE IS SET
//    If the variable is missing, the server will log an error and refuse to start.
if (!TARGET_AWS_BASE_URL) {
    console.error('FATAL ERROR: The TARGET_AWS_BASE_URL environment variable is not set.');
    console.error('Please set it in your Vercel project settings.');
    process.exit(1); // Exit with a failure code
}


// --- Proxy Setup ---

const proxy = httpProxy.createProxyServer({
    target: TARGET_AWS_BASE_URL,
    changeOrigin: true,
});

// --- Server Creation ---

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

// --- Event Handling ---

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err);
    if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end('Proxy Error: Could not connect to the target service.');
});


// --- Start the Server ---

server.listen(PORT, () => {
    console.log(`🚀 Lightweight Node.js Proxy listening on port ${PORT}`);
    // Log the target URL to confirm it's loaded correctly, but be mindful of sensitive info in logs.
    console.log(`➡️  Forwarding all requests to: ${TARGET_AWS_BASE_URL}`);
});
