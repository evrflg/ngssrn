#!/bin/bash

# 将 android/build.gradle 中的 AGP 固定为 8.5.0（兼容当前 Android Studio）
# 在 prebuild 重新生成 android 后自动执行，无需手动改

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_GRADLE="$PROJECT_DIR/android/build.gradle"

if [ ! -f "$BUILD_GRADLE" ]; then
  echo "android/build.gradle 不存在，跳过 AGP 修补"
  exit 0
fi

if grep -q "com.android.tools.build:gradle:8.5.0" "$BUILD_GRADLE"; then
  echo "AGP 已是 8.5.0，跳过"
  exit 0
fi

# 将 classpath('com.android.tools.build:gradle') 改为带版本的 8.5.0（兼容 Linux/macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/classpath('com.android.tools.build:gradle')/classpath('com.android.tools.build:gradle:8.5.0')/" "$BUILD_GRADLE"
else
  sed -i "s/classpath('com.android.tools.build:gradle')/classpath('com.android.tools.build:gradle:8.5.0')/" "$BUILD_GRADLE"
fi
echo "已修补 android/build.gradle: AGP 8.5.0"

exit 0
