#!/bin/bash

# 启动图替换脚本
# 将 appConfig/images/splashscreen.png 替换到 Android 的所有密度目录
# 将 appConfig/images/transparent_logo.png 复制到 drawable 目录

# 颜色输出
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}替换 Android 启动图${NC}"
echo -e "${BLUE}========================================${NC}"

# 源文件路径
SOURCE_IMAGE="appConfig/images/splashscreen.png"
TRANSPARENT_LOGO="appConfig/images/transparent_logo.png"

# 检查源文件是否存在
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo -e "${RED}错误: 启动图不存在: $SOURCE_IMAGE${NC}"
    exit 1
fi

if [ ! -f "$TRANSPARENT_LOGO" ]; then
    echo -e "${RED}错误: 透明logo不存在: $TRANSPARENT_LOGO${NC}"
    exit 1
fi

# 显示源文件信息
echo -e "${YELLOW}启动图: $SOURCE_IMAGE${NC}"
echo -e "${YELLOW}透明logo: $TRANSPARENT_LOGO${NC}"

# Android 密度目录列表
DENSITY_DIRS=(
    "android/app/src/main/res/drawable-mdpi"
    "android/app/src/main/res/drawable-hdpi"
    "android/app/src/main/res/drawable-xhdpi"
    "android/app/src/main/res/drawable-xxhdpi"
    "android/app/src/main/res/drawable-xxxhdpi"
)

echo -e "\n${BLUE}=== 复制启动图到各密度目录 ===${NC}"
# 复制启动图到各个密度目录
for dir in "${DENSITY_DIRS[@]}"; do
    TARGET_PATH="$dir/splashscreen_logo.png"
    
    # 检查目录是否存在
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
    fi
    
    # 复制启动图
    if cp "$SOURCE_IMAGE" "$TARGET_PATH"; then
        echo -e "${GREEN} 成功复制启动图到: $TARGET_PATH${NC}"
    else
        echo -e "${RED} 复制启动图失败: $TARGET_PATH${NC}"
    fi
done

# 复制透明logo到主drawable目录
echo -e "\n${BLUE}=== 复制透明logo到drawable目录 ===${NC}"
MAIN_DRAWABLE="android/app/src/main/res/drawable"
if [ ! -d "$MAIN_DRAWABLE" ]; then
    mkdir -p "$MAIN_DRAWABLE"
fi

MAIN_TRANSPARENT_PATH="$MAIN_DRAWABLE/transparent_logo.png"
if cp "$TRANSPARENT_LOGO" "$MAIN_TRANSPARENT_PATH"; then
    echo -e "${GREEN} 成功复制透明logo到: $MAIN_TRANSPARENT_PATH${NC}"
else
    echo -e "${RED} 复制透明logo失败: $MAIN_TRANSPARENT_PATH${NC}"
fi

# 修改styles.xml
echo -e "\n${BLUE}=== 修改styles.xml配置 ===${NC}"
STYLES_XML="android/app/src/main/res/values/styles.xml"

if [ ! -f "$STYLES_XML" ]; then
    echo -e "${RED} 错误: styles.xml文件不存在: $STYLES_XML${NC}"
    exit 1
fi

# 简单替换方法
if sed -i '' 's/@color\/splashscreen_background/@drawable\/splashscreen_logo/g' "$STYLES_XML" && \
   sed -i '' 's/<item name="windowSplashScreenAnimatedIcon">@drawable\/splashscreen_logo<\/item>/<item name="windowSplashScreenAnimatedIcon">@drawable\/transparent_logo<\/item>/g' "$STYLES_XML"; then
    echo -e "${GREEN} 成功修改styles.xml配置${NC}"
    
    # 检查是否已经存在windowSplashScreenIconBackgroundColor，如果不存在则添加
    if ! grep -q "windowSplashScreenIconBackgroundColor" "$STYLES_XML"; then
        sed -i '' 's/<item name="postSplashScreenTheme">/<item name="windowSplashScreenIconBackgroundColor">@android:color\/transparent<\/item>\
    <item name="postSplashScreenTheme">/g' "$STYLES_XML"
        echo -e "${GREEN} 添加了windowSplashScreenIconBackgroundColor配置${NC}"
    else
        echo -e "${YELLOW} windowSplashScreenIconBackgroundColor已存在，跳过添加${NC}"
    fi
else
    echo -e "${RED} 修改styles.xml失败${NC}"
fi

echo -e "\n${GREEN}启动图和透明logo替换完成！${NC}"
