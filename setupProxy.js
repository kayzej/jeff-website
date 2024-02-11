const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/api', createProxyMiddleware({ target: 'http://82.165.214.184:8080', changeOrigin: true }));
};
