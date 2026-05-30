// 安装阶段：不缓存，直接激活
// skipWaiting() 让新的 SW 立即接管，不需要等待所有标签页关闭
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// 激活阶段：清理旧缓存并接管页面
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))

        // 检查是否有客户端
        const clientList = await self.clients.matchAll()
        console.log('📱 发现客户端数量:', clientList.length)

        // 不等待 claim() 完成，直接执行（避免卡住）
        self.clients
          .claim()
          .then(() => {
            console.log('✅ Service Worker 控制页面成功')
          })
          .catch((err) => {
            console.warn('⚠️ clients.claim() 失败:', err)
          })
      } catch (error) {
        console.error('❌ activate 失败:', error)
      }
    })(),
  )
})

// 监听网页发来的消息，打开 PWA
// 使用方式：navigator.serviceWorker.controller.postMessage({ type: 'OPEN_PWA', url: '/h5/' })
self.addEventListener('message', (event) => {
  const data = event.data
  console.log('🚀 ~ message:', data)

  if (data?.type === 'OPEN_PWA' && data.url) {
    console.log('OPEN_PWA', data.url)
    event.waitUntil(clients.openWindow(data.url))
  }
})

// 可选：处理通知点击事件唤起 PWA
self.addEventListener('notificationclick', (event) => {
  const url = event.notification?.data?.url
  event.waitUntil(clients.openWindow(url))
})
