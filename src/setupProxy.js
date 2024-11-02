const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: process.env.REACT_APP_API_URL,
            changeOrigin: true,
            secure: false,
            withCredentials: true,
            pathRewrite: {'^/api': ''},
            onProxyReq: function(proxyReq, req, res) {
                proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            }
        })
    );
}; 