const { spawn } = require('child_process');
const path = require('path');

console.log('Starting backend server...');

const backendPath = path.join(__dirname, 'Backend');
console.log('Backend path:', backendPath);

const serverProcess = spawn('npm', ['start'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
});

serverProcess.on('error', (error) => {
    console.error('Failed to start server:', error);
});

serverProcess.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('Shutting down...');
    serverProcess.kill();
    process.exit();
});
