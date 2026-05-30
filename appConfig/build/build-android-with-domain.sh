#!/bin/bash

# 导入共享函数库
source "$(dirname "$0")/build-domain-config-utils.sh"

# 从 config.js 获取默认域名
DEFAULT_DOMAIN=$(node -e "console.log(require('$PROJECT_DIR/appConfig/config').DOMAIN_URL_ANDROID)")

# 初始化变量
DOMAIN=$DEFAULT_DOMAIN
DO_CLEAN=false

# 解析命令行参数
parse_args DOMAIN DO_CLEAN "$@"

# 设置环境变量
export DOMAIN_URL=$DOMAIN

# 打印当前配置
print_title "Android" "$DOMAIN" "$DO_CLEAN"

# 进入项目目录
enter_project_dir || { echo -e "${RED}无法进入项目目录${NC}"; exit 1; }

# sed -i：macOS 与 GNU sed 参数不同
sed_inplace() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# 运行prebuild
run_prebuild "android" "$DO_CLEAN" || { echo -e "${RED}Prebuild 失败${NC}"; exit 1; }

# 自动修补 AGP 版本（prebuild 会重新生成 android，需固定为 8.5.0 以兼容当前 Android Studio）
# 必须用子进程 bash 调用，不能 source：patch-agp-android.sh 里有多处 exit 0，
# source 会在当前 shell 直接退出，导致后面的域名配置（configure_android_domain）整段被跳过。
bash "$(dirname "$0")/patch-agp-android.sh"

# 检查域名是否与当前域名一致
check_domain_consistency() {
  local file=$1
  local current_domain=$2
  
  if [ -f "$file" ]; then
    local existing_domain=$(grep -o 'DOMAIN_URL = "[^"]*"' "$file" | cut -d'"' -f2)
    
    if [ "$existing_domain" == "$current_domain" ]; then
      echo -e "${YELLOW}域名一致，跳过更新: $file${NC}"
      return 1  # 不需要更新
    else
      echo -e "${YELLOW}域名不一致，需要更新: $file${NC}"
      echo -e "${YELLOW}原域名: $existing_domain${NC}"
      echo -e "${YELLOW}新域名: $current_domain${NC}"
      return 0  # 需要更新
    fi
  else
    return 0  # 文件不存在，需要创建
  fi
}

# 配置Android的域名
configure_android_domain() {
  local domain=$1
  
  # 1.直接复制整个 config 目录到「与 appConfig/config.js 里 BUNDLE_ID 一致」的包路径下
  # 包路径完全由 appConfig/config.js 的 BUNDLE_ID 决定（改包名后重新 prebuild 即可）
  local TEMPLATE_DIR="appConfig/build/android/config"
  local ANDROID_APP_ID
  ANDROID_APP_ID=$(node -e "console.log(require('$PROJECT_DIR/appConfig/config').BUNDLE_ID)")
  local PACKAGE_PATH
  PACKAGE_PATH=$(echo "$ANDROID_APP_ID" | tr '.' '/')
  local TARGET_DIR="./android/app/src/main/java/${PACKAGE_PATH}/config"
  
  echo -e "\n${BLUE}=== 复制config目录 ===${NC}"
  echo -e "${BLUE} applicationId / 包路径: ${ANDROID_APP_ID} -> ${TARGET_DIR}${NC}"
  
  if [ -d "$TEMPLATE_DIR" ]; then
    # 删除已存在的目录，复制整个目录
    rm -rf "$TARGET_DIR"
    mkdir -p "$(dirname "$TARGET_DIR")"
    if ! cp -r "$TEMPLATE_DIR" "$TARGET_DIR"; then
      echo -e "${RED} 复制 config 模板失败${NC}"
      return 1
    fi
    echo -e "${GREEN} config目录复制成功${NC}"
    
    # 模板仍为 package com.ng.app.ngrn.config，复制后改成 ${ANDROID_APP_ID}.config 以匹配目录
    local f
    for f in "$TARGET_DIR"/*.java; do
      [ -f "$f" ] || continue
      sed_inplace "s/^package com\.ng\.app\.ngrn\.config;/package ${ANDROID_APP_ID}.config;/g" "$f"
    done
    
    # 2.更新DomainModule.java中的域名
    local DOMAIN_MODULE="$TARGET_DIR/DomainModule.java"
    if [ -f "$DOMAIN_MODULE" ]; then
      echo -e "${BLUE} 更新域名: $domain${NC}"
      # 用 # 分隔，避免域名里的 / 干扰 sed
      sed_inplace "s#private static final String DOMAIN_URL = \"[^\"]*\"#private static final String DOMAIN_URL = \"${domain}\"#g" "$DOMAIN_MODULE"
      echo -e "${GREEN} 域名更新成功${NC}"
    else
      echo -e "${RED} DomainModule.java 不存在${NC}"
      return 1
    fi
  else
    echo -e "${RED} 模板目录不存在: $TEMPLATE_DIR${NC}"
    return 1
  fi
  
  # 3.更新 MainApplication.kt；失败必须中断，否则后面会误以为「域名已配好」
  export ANDROID_APP_ID
  update_main_application || return 1
}

# 更新MainApplication.kt的函数
update_main_application() {
  echo -e "\n${BLUE}=== 更新 MainApplication ===${NC}"

  # 只取第一个，避免多模块工程 find 顺序不确定
  local MAIN_APP_FILE
  MAIN_APP_FILE=$(find ./android/app/src/main/java -name "MainApplication.kt" 2>/dev/null | head -n 1)

  if [ -z "$MAIN_APP_FILE" ]; then
    echo -e "${RED} 找不到 MainApplication.kt 文件${NC}"
    return 1
  fi

  if [ -z "$ANDROID_APP_ID" ]; then
    echo -e "${RED} 未设置 ANDROID_APP_ID（应由 configure_android_domain 导出）${NC}"
    return 1
  fi

  local CONFIG_IMPORT="import ${ANDROID_APP_ID}.config.ConfigPackage"

  # 去掉旧脚本写死的 import，避免换包名后重复或错包
  sed_inplace '/^import com\.ng\.app\.ngrn\.config\.ConfigPackage$/d' "$MAIN_APP_FILE"

  # 添加import语句
  if ! grep -Fq "$CONFIG_IMPORT" "$MAIN_APP_FILE"; then
    # 找到最后一个import语句
    local LAST_IMPORT_LINE=$(grep -n '^import ' "$MAIN_APP_FILE" | tail -n1 | cut -d: -f1)
    if [ -n "$LAST_IMPORT_LINE" ]; then
      # 在最后一个import语句后添加新的import，后面跟一个空行
      sed_inplace "${LAST_IMPORT_LINE}a\\
${CONFIG_IMPORT}\\
\\
" "$MAIN_APP_FILE"
      echo -e "${GREEN} 已添加 ConfigPackage import 语句${NC}"
    else
      echo -e "${RED} 未找到 import 语句块，无法添加 ConfigPackage 导入${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW} 已包含 ConfigPackage import 语句${NC}"
  fi

  if ! grep -Fq "$CONFIG_IMPORT" "$MAIN_APP_FILE"; then
    echo -e "${RED} 校验失败: MainApplication.kt 中仍缺少「${CONFIG_IMPORT}」${NC}"
    return 1
  fi

  # 添加 ConfigPackage 到 packages
  if ! grep -q 'packages.add(ConfigPackage())' "$MAIN_APP_FILE"; then
    if grep -q "return packages" "$MAIN_APP_FILE"; then
      # Expo / RN 默认模板：PackageList + return packages
      sed_inplace -e '/return packages/i\
            packages.add(ConfigPackage())\' "$MAIN_APP_FILE"
      echo -e "${GREEN} 已添加 ConfigPackage 到 PackageList${NC}"
    elif grep -q "return.*listOf" "$MAIN_APP_FILE"; then
      sed_inplace -e '/return.*listOf/s/listOf(/listOf(\n            ConfigPackage(),/' "$MAIN_APP_FILE"
      echo -e "${GREEN} 已添加 ConfigPackage 到 listOf${NC}"
    else
      echo -e "${RED} 未识别 MainApplication.getPackages() 模板（无 return packages / listOf），请手动注册 ConfigPackage${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW} 已包含 packages.add(ConfigPackage())${NC}"
  fi

  if ! grep -q 'packages.add(ConfigPackage())' "$MAIN_APP_FILE"; then
    echo -e "${RED} 校验失败: MainApplication.kt 中仍缺少 packages.add(ConfigPackage())${NC}"
    return 1
  fi
}

# 执行主要配置函数（失败则非 0 退出，避免静默成功）
configure_android_domain "$DOMAIN" || {
  echo -e "\n${RED}Android 域名脚本失败，请根据上文日志排查。${NC}"
  exit 1
}

echo -e "\n${GREEN}域名配置已完成!${NC}"
echo -e "${GREEN}当前域名:${NC} $DOMAIN"
PACKAGE_PATH_OUT=$(echo "$(node -e "console.log(require('$PROJECT_DIR/appConfig/config').BUNDLE_ID)")" | tr '.' '/')
echo -e "${GREEN}配置文件位置:${NC} ./android/app/src/main/java/${PACKAGE_PATH_OUT}/config"

# 与中间 expo prebuild 海量日志区分：终端底部若接着跑 splash，请向上搜「复制config」或本段标题
echo -e "\n${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  build-android-with-domain.sh 已结束（含上方 expo prebuild 输出）${NC}"
echo -e "${GREEN}  若与 splash 串联执行，启动图日志会继续出现在下面。${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}\n"

# node ./appConfig/build/mtpush/init.js