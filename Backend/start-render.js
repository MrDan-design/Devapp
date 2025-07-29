#!/usr/bin/env node

// Render.com startup script with error handling
const express = require('express');
const cors = require('cors');

console.log('🚀 Starting Render deployment...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

// Check critical environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('DB') || key === 'DATABASE_URL'));
}

try {
    // Start the main application
    require('./app.js');
} catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
}
