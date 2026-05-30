echo "～～～～～～～～打包准备～～～～～～～～"
pwd
npm run clean-npm
rm -rf node_modules package-lock.json android ios
npm install
npm dedupe



npm run prebuild-android-with-domain
./splashScreen.sh
npm run prebuild-ios-with-domain



BUILD_GRADLE="android/app/build.gradle"

# 检查是否已包含 pickFirst
if grep -q "lib/**/libworklets.so" "$BUILD_GRADLE"; then
  echo "✅ pickFirst 已存在，无需修改"
  exit 0
fi

# 使用 sed 插入到 android { ... } 中
# 注意 macOS 上的 sed 需要加 ''
sed -i '' "/android {/a\\
    packagingOptions {\\
        pickFirst 'lib/**/libworklets.so'\\
    }\\
" "$BUILD_GRADLE"

echo "✅ 已自动添加 packagingOptions 到 android/app/build.gradle"

