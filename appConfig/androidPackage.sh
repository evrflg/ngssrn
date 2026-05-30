#!/bin/bash

# 颜色变量
red=31m
green=32m
yellow=33m

# 颜色方法
function textColor() 
{ 
  echo "\033[${1}$2\033[0m"; 
}

# 查找匹配的目录 
jdk_dir=$(find "$HOME/Library/Java" -type d -name "*corretto-17.0.11*" 2>/dev/null)

if [ -n "$jdk_dir" ]; then
  # 设置 JAVA_17_HOME 环境变量
  export JAVA_17_HOME="$HOME/Library/Java/JavaVirtualMachines/corretto-17.0.11/Contents/Home"
  # 直接设置 JAVA_HOME 环境变量，而不是使用 alias
  export JAVA_HOME=$JAVA_17_HOME
  # 验证 JAVA_HOME 是否已切换
  java --version
else
  echo "未找到符合条件的 JDK 目录"
fi

# 获取当前脚本所在目录
script_dir=$(cd $(dirname $0);cd ..; pwd)
# 工程根目录
PROJECT_DIR=${script_dir}'/android/'
# echo $PROJECT_DIR
# #输出到桌面
APP_OUTPUT_PATH=$HOME'/Desktop/'
# echo $APP_OUTPUT_PATH

#App 用户名称
app_name=$(node -e '
  var myVar = require("./appConfig/config.js").NAME;
  console.log(myVar);
')
# echo "app_name: $app_name"
# 用户名称为空时，结束进程
if [ -z "$app_name" ]; then
    textColor ${red} "用户名称不得为空，停止打包"
    exit 0
fi

#Apk 名称
bundle_id=$(node -e '
  var myVar = require("./appConfig/config.js").BUNDLE_ID;
  console.log(myVar);
')
# echo "bundle_id: $bundle_id"

# 指定输出apk名称， ##号撷取，删除包名最后一个.左边字符，保留右边
#preview ces测试 或 production正式  
edit_file=${script_dir}'/eas.json'
if cat ${edit_file} | grep 'ces' > /dev/null; then
  apk_name=${bundle_id##*.}'(ngssRN)测试'
  textColor ${red} "目前打包版本：测试包"
else
  apk_name=${bundle_id##*.}'(ngssRN)'
  textColor ${green} "目前打包版本：正式包"
fi
#echo "apk_name: $apk_name"

#工程目录
ANDROID_PROJECT_MODULE_NAME='app'
DEFAULT_APK_OUTPUT=${PROJECT_DIR}${ANDROID_PROJECT_MODULE_NAME}'/build/outputs/apk/release/'
APK_DEFAULT_NAME_UNSIGN=${ANDROID_PROJECT_MODULE_NAME}'-release.apk'

#真正打包安卓APK
buildApk(){
  if [ ! -f ${GRADLE_EXEC_FILE} ]; then
    echo 'have not found gradlew execute file'
    exit 0
  fi
  chmod a+x ${GRADLE_EXEC_FILE}
  checkApk
  #切换进工程目录
  cd $PROJECT_DIR
  echo 'start clean project ------------------'
  ./gradlew clean
  echo 'start release build apk --------------'
  ./gradlew assembleRelease
}

#导出apk到用户指定目录
exportApk(){
#   if [ ! -d $APP_OUTPUT_PATH ]; then
#     mkdir $APP_OUTPUT_PATH
#   fi
  outputApkName=${apk_name}'.apk'

  echo ${DEFAULT_APK_OUTPUT}${APK_DEFAULT_NAME_UNSIGN} ${APP_OUTPUT_PATH}${outputApkName}
  mv ${DEFAULT_APK_OUTPUT}${APK_DEFAULT_NAME_UNSIGN} ${APP_OUTPUT_PATH}${outputApkName}
  #open ${APP_OUTPUT_PATH}
}

# 确认原始路径底下是否有旧安装包并删除
checkApk(){
  if [ -f ${DEFAULT_APK_OUTPUT}${APK_DEFAULT_NAME_UNSIGN} ]; then
    rm ${DEFAULT_APK_OUTPUT}${APK_DEFAULT_NAME_UNSIGN}
    textColor ${red} "删除旧安装包"
  else
    textColor ${green} "没有旧安装包"
  fi
}

startBuild(){
  GRADLE_EXEC_FILE=${PROJECT_DIR}'gradlew'
  buildApk
  echo 'start export apk --------------------------'
  exportApk
  echo 'end export apk ----------------------------'
}

startBuild
