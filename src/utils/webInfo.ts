/**
 * 更新 favicon
 * @param iconUrl 图标 UR
 */
export const updateFavicon = (iconUrl?: string) => {
  if (!iconUrl) return

  // 更新 favicon
  let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement
  if (!faviconLink) {
    faviconLink = document.createElement('link')
    faviconLink.rel = 'icon'
    document.head.appendChild(faviconLink)
  }
  faviconLink.href = iconUrl
}
/**
 * 更新 apple-touch-icon
 * @param iconUrl 图标 URL，可选，如果未传则使用 sessionStorage 中的 appInfo.appStore.appIcon
 */
export const updateAppleTouchIcon = (iconUrl?: string) => {
  if (!iconUrl) return
  // 更新 apple-touch-icon
  let appleTouchIconLink = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
  if (!appleTouchIconLink) {
    appleTouchIconLink = document.createElement('link')
    appleTouchIconLink.rel = 'apple-touch-icon'
    appleTouchIconLink.setAttribute('sizes', '114x114')
    appleTouchIconLink.setAttribute('type', 'image/x-icon')
    document.head.appendChild(appleTouchIconLink)
  }
  appleTouchIconLink.href = iconUrl
}

/**
 * 更新 iOS Web App 应用名称
 * @param appName 应用名称，可选，如果未传则使用 sessionStorage 中的 appInfo.appName
 */
export const updateIOSAppTitle = (appName?: string) => {
  if (!appName) return

  // 更新 apple-mobile-web-app-title
  let appTitleMeta = document.querySelector(
    'meta[name="apple-mobile-web-app-title"]',
  ) as HTMLMetaElement
  if (!appTitleMeta) {
    appTitleMeta = document.createElement('meta')
    appTitleMeta.name = 'apple-mobile-web-app-title'
    document.head.appendChild(appTitleMeta)
  }
  appTitleMeta.content = appName
}
