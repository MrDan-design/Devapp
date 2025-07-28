const express = require('express');
const cors = require('cors');

const app = express();

console.log('Starting server...');

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
    console.log('Root route hit');
    res.json({ message: 'Server is running', status: 'OK' });
});

// Health check
app.get('/health', (req, res) => {
    console.log('Health check hit');
    res.json({ status: 'healthy' });
});

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
