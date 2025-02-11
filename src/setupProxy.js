// filepath: /Users/jan_wu/Documents/Cline/floorplan2/floorplan-app/src/setupProxy.jsß
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {ß
  app.use(
    '/images',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
    })
  );
};