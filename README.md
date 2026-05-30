如果更新代码npm i 出现报错请执行
npm i --froce

如果运行app 请执行
npm run ios
npm run android

如果运行app出现和代码无关的报错尝试清理缓存
npx expo start -c 
或者
删除ios 或者 android 目录重新运行 npm run ios/android



npx tailwindcss -i ./global.css -o ./src/tailwind.css --watch
npm install --force 或 npm install --legacy-peer-deps

cli 版本不兼容处理办法
npm uninstall -g expo-cli
npm install -D @expo/cli

npx expo start -c 

app端报错：提示要在"dependencies"添加"@react-native-community/cli": "latest"
解决方法：npm install @react-native-community/cli@latest

### package.json 命令说明

1. `clean XX` - 清理命令
2. `prebuild` - 更新app信息
3. `prebuild-android-with-domain` - 原生 android 域名脚本 + android 12+启动屏设置
4. `prebuild-ios-with-domain` - 原生 ios 域名脚本
5. `脚本2-4 -- --clean` - 清理重新构建原生代码
6. `android` - 运行 android 命令（没有android原生代码会直接生成，但是没有原生域名部分代码，建议执行 `脚本3`）
7. `ios` - 运行 ios 命令（没有ios原生代码会直接生成，但是没有原生域名部分代码，建议执行 `脚本4`）
8. `web` - 运行 web 命令
9. `build:web` - 打包 web 命令
10.`build:android` - 打包 android 命令
11.`init` - 项目刚拉代码，初始化命令（执行了，三端都要能正常跑起来）


### android
# gradle
8.10.2
清理：rm -rf ./android/.gradle

# 缓存
清理：./gradlew clean
