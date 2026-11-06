
const express = require('express');
const {
    createProxyMiddleware
} = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Route requests to User Service
app.use('/users', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true
}));

// Route requests to Task Service
app.use('/tasks', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true
}));

// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Gateway error handling
app.use((err, req, res, next) => {
    console.error('Gateway error:', err.message);

    res.status(502).json({
        error: 'Backend service unavailable'
    });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
