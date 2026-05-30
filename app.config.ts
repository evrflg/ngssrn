import type { ConfigContext, ExpoConfig } from '@expo/config';

import { ClientEnv, Env } from './env.js';
import { NAME, BUNDLE_ID, DOMAIN_URL_IOS } from './appConfig/config.js'

const easConfig = require('./eas.json').build

// 保证 NODE_ENV 有默认值
const nodeEnv = process.env.NODE_ENV || 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: NAME, //应用程序名称
  description: `${NAME} Mobile App`, //简要描述您的应用程序是什么
  owner: Env.EXPO_ACCOUNT_OWNER, //拥有该项目的 Expo 帐户的名称
  scheme: 'ngss-rn-ng', //链接到您应用的 URL 方案（需与 EAS 项目 slug 一致）
  slug: 'ngss-rn-ng', // 与 EAS 项目一致，否则 eas update 会报错
  version: Env.VERSION, //您的应用版本
  orientation: 'portrait', //将应用锁定为特定方向 portrait-纵向
  icon: './appConfig/images/logo.png', //用于应用图标的图像的本地路径或远程 URL
  userInterfaceStyle: 'automatic', //配置强制应用始终使用浅色或深色用户界面外观
  newArchEnabled: true,
  splash: { //应用程序的加载和启动画面的配置
    image: './appConfig/images/splashscreen.png',
    resizeMode: 'cover',
    backgroundColor: '#2E3C4B',
  },
  updates: {
    fallbackToCacheTimeout: 0, //在应用启动后，等待应用检查并获取新更新的时间（以毫秒为单位），之后再恢复设备上已有的最新更新。
    url: `https://u.expo.dev/${Env.EAS_PROJECT_ID}`,
    checkAutomatically: 'NEVER', // 自动热更新: NEVER(不自动更新) ON_LOAD(在应用启动时检查更新) ON_ERROR_RECOVERY(在错误恢复时检查更新) WIFI_ONLY(仅在 WiFi 连接时检查更新)
    requestHeaders: {
      "expo-channel-name": easConfig.preview.channel
    }
  },
  // runtimeVersion: Env.VERSION,
  runtimeVersion: "1.0.0",
  assetBundlePatterns: ['**/*'],
  ios: {
    // runtimeVersion: "1.0.0",
    supportsTablet: true, //您的独立 iOS 应用是否支持平板电脑屏幕尺寸
    bundleIdentifier: BUNDLE_ID,
    infoPlist: { // 自定义 info.plist 配置
      CFBundleName: NAME, // 应用名
      CFBundleIdentifier: BUNDLE_ID, // bundleID
      domain_url: DOMAIN_URL_IOS, // DOMAIN_URL_IOS
      /**
       * iOS 9+ 白名单：WebView/Linking.canOpenURL 只能识别此处声明过的 scheme。
       * 用于充值页嵌套的三方支付 WebView 唤起对应 App（GCash、PayMaya/Maya、微信、支付宝、PayPal 等）。
       */
      LSApplicationQueriesSchemes: [
        "gcash",
        "com.mynt.gcashApp",
        "paymaya",
        "mayapay",
        "weixin",
        "wechat",
        "alipay",
        "alipays",
        "paypal",
        "tel",
        "mailto"
      ]
    }
  },
  android: {
    // runtimeVersion: "1.0.0",
    package: BUNDLE_ID,
    permissions: ["ACCESS_NETWORK_STATE"],
    softwareKeyboardLayoutMode: 'pan',

  },
  web: {
    bundler: 'metro',
    // output: 'static',
    favicon: './appConfig/images/logo.png'
  },
  experiments: {
    baseUrl: Env.BASE_URL,
    typedRoutes: true,
  },
  plugins: [
    [
      'expo-font',
      {
        fonts: ['./src/assets/fonts/SpaceMono-Regular.ttf'],
      },
    ],
    'expo-router',
    'expo-localization',
    /** Prebuild 时保证 android/gradle.properties 含 expo.webp.animated=true（expo-build-properties 无此字段） */
    './src/scripts/withAndroidExpoWebp',
    './src/scripts/withAdjust',
    './src/scripts/withJPush',
    './src/scripts/withPackagingOptions'
  ],
  extra: {
    ...ClientEnv,
    NODE_ENV: nodeEnv,
    eas: {
      projectId: Env.EAS_PROJECT_ID
    },
  },
});
