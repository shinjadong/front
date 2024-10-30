const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://db705ff68777754c.ngrok.app',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                '^/api': ''
            },
            onProxyRes: function(proxyRes, req, res) {
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            }
        })
    );
}; 