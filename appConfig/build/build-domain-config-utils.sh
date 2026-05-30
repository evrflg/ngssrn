#!/bin/bash

# 颜色定义
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly RED='\033[0;31m'
readonly NC='\033[0m' # No Color

# 获取当前项目的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 打印函数
print_title() {
  local platform=$1
  local domain=$2
  local do_clean=$3
  
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}${platform} 域名配置${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}API 域名:${NC} $domain"
  echo -e "${BLUE}清理重构:${NC} $([ "$do_clean" = true ] && echo "是" || echo "否")"
  echo -e "${BLUE}========================================${NC}"
}

# 处理命令行参数
parse_args() {
  local domain_var_name=$1
  local do_clean_var_name=$2
  shift 2
  
  while [[ $# -gt 0 ]]; do
    case $1 in
      -d|--domain)
        eval "$domain_var_name='$2'"
        shift 2
        ;;
      -c|--clean)
        eval "$do_clean_var_name=true"
        shift
        ;;
      *)
        echo -e "${RED}未知选项: $1${NC}"
        exit 1
        ;;
    esac
  done
}

# 运行prebuild
run_prebuild() {
  local platform=$1
  local do_clean=$2
  
  # 确保在正确的目录中执行命令
  cd "$PROJECT_DIR" || return 1
  
  echo -e "${BLUE}当前工作目录: $(pwd)${NC}"
  
  # 首先执行 expo prebuild
  echo -e "${BLUE}执行 expo prebuild...${NC}"
  npx cross-env EXPO_NO_DOTENV=1 npx expo prebuild --platform $platform || {
    echo -e "${RED}Expo prebuild 失败${NC}"
    return 1
  }
  
  # 如果需要清理，则运行 prebuild-clean
  if [ "$do_clean" = true ]; then
    echo -e "${GREEN}清理并重建 ${platform} 项目...${NC}"
    npx cross-env EXPO_NO_DOTENV=1 npx expo prebuild --clean --platform $platform || { 
      echo -e "${RED}${platform} 项目重建失败${NC}"
      return 1
    }
  fi
  
  # 检查项目目录是否存在
  if [ ! -d "./${platform}" ]; then
    echo -e "${YELLOW}${platform} 项目不存在，正在创建...${NC}"
    npx cross-env EXPO_NO_DOTENV=1 npx expo prebuild --platform $platform || {
      echo -e "${RED}${platform} 项目创建失败${NC}"
      return 1
    }
  fi
  
  return 0
}

# 检查进入项目目录
enter_project_dir() {
  cd "$PROJECT_DIR" || { 
    echo -e "${RED}无法进入项目目录${NC}"
    return 1
  }
  echo -e "${BLUE}进入项目目录: $(pwd)${NC}"
  return 0
} 