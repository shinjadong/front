const path = require('path');

module.exports = {
  devServer: {
    allowedHosts: ['localhost', '.ngrok.app'],
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://db705ff68777754c.ngrok.app',
        changeOrigin: true,
        secure: false,
        pathRewrite: {'^/api': ''}
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}; 