const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const appConfig = require('./appConfig/config');
const app = express();

// "重要" use 是有順序的，有新增的要在/前
const targetUrl = appConfig.DOMAIN_URL_IOS
console.log(`targetUrl: ${targetUrl}`)
app.use('/dev', createProxyMiddleware({
  target: targetUrl,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      const oldReferer = proxyReq.getHeader('Referer')
      if (typeof oldReferer !== 'string') return
      const oldRefererUrl = new URL(oldReferer)
      oldRefererUrl.hostname = targetUrl.replace('https://', '')
      proxyReq.setHeader('Referer', oldRefererUrl.toString())
    },
  },
}));

// 遠端圖片轉址
['/common'].forEach(path => {
  app.use(path, createProxyMiddleware({
    target: targetUrl + path,
    changeOrigin: true,
    //logLevel: 'debug', // 方便調試
  }));
})

// 這個要最後喔
// 把其他請求導向expo的服務器
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  ws: true, 
  logLevel: 'debug', // 方便調試
}));

//配置服务端口
app.listen(3000, () => {
  console.log(`本地测试链结： http://localhost:3000`);
});
