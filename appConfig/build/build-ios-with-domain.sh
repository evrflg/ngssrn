#!/bin/bash

# 导入共享函数库
source "$(dirname "$0")/build-domain-config-utils.sh"

# 从 config.js 获取默认域名
DEFAULT_DOMAIN=$(node -e "console.log(require('$PROJECT_DIR/appConfig/config').DOMAIN_URL_IOS)")

# 初始化变量
DOMAIN=$DEFAULT_DOMAIN
DO_CLEAN=false

# 解析命令行参数
parse_args DOMAIN DO_CLEAN "$@"

# 设置环境变量
export DOMAIN_URL=$DOMAIN

# 打印当前配置
print_title "iOS" "$DOMAIN" "$DO_CLEAN"

# 进入项目目录
enter_project_dir || exit 1

# 运行prebuild
run_prebuild "ios" "$DO_CLEAN" || exit 1

# iOS 项目目录（应用主工程在 ios/*.xcodeproj，不能用递归 find：否则会命中 ios/Pods/Pods.xcodeproj，
# 导致 DomainModule.m 被复制到 Pods 目录且改错工程）
IOS_DIR="./ios"
PROJECT_NAME=""
for xcodeproj_dir in "$IOS_DIR"/*.xcodeproj; do
  [ -d "$xcodeproj_dir" ] || continue
  base=$(basename "$xcodeproj_dir" .xcodeproj)
  if [ "$base" = "Pods" ]; then
    continue
  fi
  PROJECT_NAME=$base
  break
done

if [ -z "$PROJECT_NAME" ]; then
  echo -e "${RED}找不到 iOS 应用 xcodeproj（已排除 Pods）。请确认已执行 prebuild 且 $IOS_DIR 下存在 *.xcodeproj${NC}"
  exit 1
fi

echo -e "${BLUE}检测到应用 Xcode 工程名: ${PROJECT_NAME}${NC}"

# 复制 DomainModule.m 文件
echo -e "\n${BLUE}=== 复制 DomainModule.m 文件 ===${NC}"
DOMAIN_MODULE_FILE="$IOS_DIR/$PROJECT_NAME/DomainModule.m"
TEMPLATE_FILE="appConfig/build/ios/DomainModule.m"
FILE_CREATED=false

# 检查模板文件是否存在
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo -e "${RED} 模板文件不存在: $TEMPLATE_FILE${NC}"
  exit 1
fi

# 检查 DomainModule.m 文件是否已存在
if [ -f "$DOMAIN_MODULE_FILE" ]; then
  echo -e "${YELLOW} DomainModule.m 文件已存在，跳过复制...${NC}"
else
  # 直接复制模板文件
  if ! cp "$TEMPLATE_FILE" "$DOMAIN_MODULE_FILE"; then
    echo -e "${RED} 复制失败: $TEMPLATE_FILE -> $DOMAIN_MODULE_FILE${NC}"
    exit 1
  fi
  echo -e "${GREEN} DomainModule.m 文件已复制: $DOMAIN_MODULE_FILE${NC}"
  FILE_CREATED=true
fi

# 只有在文件刚刚被创建时才更新桥接头文件和项目文件
echo -e "\n${BLUE}=== 更新桥接头文件和项目文件 ===${NC}"
if [ "$FILE_CREATED" = true ]; then
  # 更新桥接头文件
  BRIDGING_HEADER_FILE="$IOS_DIR/$PROJECT_NAME/$PROJECT_NAME-Bridging-Header.h"

  if [ -f "$BRIDGING_HEADER_FILE" ]; then
    echo -e "${BLUE} 更新桥接头文件...${NC}"
    
    # 检查桥接头文件中是否已经包含 RCTBridgeModule.h
    if ! grep -q "<React/RCTBridgeModule.h>" "$BRIDGING_HEADER_FILE"; then
      # 添加 React 头文件导入
      echo -e ' #import <React/RCTBridgeModule.h>' >> "$BRIDGING_HEADER_FILE"
      echo -e "${GREEN} 已添加 RCTBridgeModule.h 导入到桥接头文件${NC}"
    fi
  fi

  # 将 DomainModule.m 添加到 Xcode 项目中
  echo -e "${BLUE} 将 DomainModule.m 添加到 Xcode 项目...${NC}"

  # 确保 xcodeproj gem 已安装
  if ! gem list -i xcodeproj > /dev/null 2>&1; then
    echo -e "${YELLOW} 安装 xcodeproj gem...${NC}"
    gem install xcodeproj || {
      echo -e "${RED} 无法安装 xcodeproj gem，跳过项目文件更新${NC}"
      echo -e "${YELLOW} 请手动将 DomainModule.m 添加到项目中${NC}"
    }
  fi

  # 使用 Ruby 脚本添加文件到 Xcode 项目
  if gem list -i xcodeproj > /dev/null 2>&1; then
    ruby -e "
    begin
      require 'xcodeproj'
      project_path = '$IOS_DIR/$PROJECT_NAME.xcodeproj'
      project = Xcodeproj::Project.open(project_path)
      target = project.targets.first
      phase = target.source_build_phase
      relative_path = '$PROJECT_NAME/DomainModule.m'
      
      # 寻找是否已存在同名文件引用
      file_ref = nil
      project.files.each do |file|
        if file.path == 'DomainModule.m'
          file_ref = file
          break
        end
      end
      
      # 如果没找到，创建新文件引用
      if file_ref.nil?
        file_ref = project.main_group.find_subpath('$PROJECT_NAME', true).new_file(relative_path)
        phase.add_file_reference(file_ref)
        puts ' DomainModule.m 已添加到项目中'
      else
        puts ' DomainModule.m 已存在于项目中'
      end
      
      project.save
    rescue => e
      puts \" 错误: \#{e.message}\"
      exit 1
    end
    " || {
      echo -e "${RED} 无法更新 Xcode 项目文件${NC}"
      echo -e "${YELLOW} 请手动将 DomainModule.m 添加到项目中${NC}"
    }
  else
    echo -e "${YELLOW} 请手动将 DomainModule.m 添加到项目中${NC}"
  fi
else
  echo -e "${YELLOW} 不是第一次运行，跳过后续桥接头文件和项目文件更新...${NC}"
fi

echo -e "\n${GREEN}iOS 域名配置已完成!${NC}"
echo -e "${GREEN}DomainModule文件位置:${NC} $DOMAIN_MODULE_FILE"
if [ "$FILE_CREATED" = true ]; then
  echo -e "\n${YELLOW}请使用 Xcode 打开项目查看 DomainModule.m 是否已添加到项目中${NC}"
  echo -e "${YELLOW}如果未添加，请手动在 Xcode 中添加该文件${NC}"
fi