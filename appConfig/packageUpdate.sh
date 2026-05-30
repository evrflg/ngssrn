#!/bin/sh

# 颜色变量
black=30m
red=31m
green=32m
yellow=33m
skybull=36m

# 颜色方法
function textColor() 
{ 
  echo "\033[${1}$2\033[0m"; 
}

# 站点编号
no=$1

# 使用Node.js执行JavaScript文件，并通过管道捕获输出
get_js_data(){
  a=$(node -e '
  var myVar = require("./appConfig/config.js").'$1';
  console.log(myVar);
  ')
  if [ -z "$a" ]; then
      a="DEFAULT"
  fi
  echo $a
}

echo "--------------------旧资料参数--------------------"
# 苹果域名
old_ios_url=`get_js_data 'DOMAIN_URL_IOS'`
echo '旧苹果域名：'${old_ios_url}

# 安卓域名
old_android_url=`get_js_data 'DOMAIN_URL_ANDROID'`
echo '旧安卓域名：'${old_android_url}

# 打包包名
old_build_id=`get_js_data 'BUNDLE_ID'`
echo '旧包名：'${old_build_id}

# App 用户名称
old_app_name=`get_js_data 'NAME'`
echo '旧用户名称：'${old_app_name}

# 获取当前脚本所在目录
script_dir=$(cd $(dirname $0);cd ..; pwd)
# 修改的文件
edit_file=$script_dir'/appConfig/config.js'
edit_image=$script_dir'/appConfig/images'
edit_eas=$script_dir'/eas.json'
ANDROID_BUNDLE_ID=$(node -e "console.log(require('$script_dir/appConfig/config').BUNDLE_ID)")
ANDROID_CONFIG_JAVA_REL="android/app/src/main/java/$(echo "$ANDROID_BUNDLE_ID" | tr '.' '/')/config/DomainModule.java"
edit_DomainModule=$script_dir'/'$ANDROID_CONFIG_JAVA_REL

# 安卓DomainModule文件域名  已用 prebuild-android-with-domain 脚本取代
# old_DomainModule_url=$(grep 'params\["getDomain"\]' "$edit_DomainModule" | awk -F'=' '{print $2}' | tr -d ' "')
# echo 'DomainModule文件域名: '${old_DomainModule_url}

textColor ${green} "-----------------打包分支 与 版本号-----------------"
# 修改分支 测试站ces，正式站line，已不使用
# if  [ "w147" = "$1" ]; then
#   bash appConfig/channel.sh 1
# else
#   bash appConfig/channel.sh 2
# fi

eas_json=$(cat $edit_eas)

# 模拟从档案读取json内容
echo "$eas_json" > temp.json

# 搜寻preview底下的key与value，從preview部分提取channel值
eas_channel=$(cat temp.json | tr -d '\n' | grep -o '"preview": {[^}]*}' | grep -o '"channel": *"[^"]*"' | awk -F'"' '{print $4}')
# echo "Preview channel: $eas_channel"

# 清除模拟暂存档
rm temp.json

#修改分支为站点编号
if [ "$eas_channel" = "$1" ]; then
  textColor ${red} "打包分支已经是 $1，跳过当前操作"
else
  if [[ "t300" = "$1" || "f001" = "$1" ]]; then
    sed -i "" "s/$eas_channel/"ces"/g" ${edit_eas}
    textColor ${green} "打包分支已修改为 ces"
  elif [[ "$1" = "ZT"* ]]; then
    lower_no=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
    sed -i '' -e "/\"preview\": {/,/}/s/\"channel\": \"[^\"]*\"/\"channel\": \"$lower_no\"/" "$edit_eas"
    # 获取更新后的channel值
    updated_channel=$(sed -n '/"preview": {/,/}/p' "$edit_eas" | grep '"channel":' | awk -F'"' '{print $4}')
    # echo "Updated Preview channel: $updated_channel"
    # 检查是否有更换channel值
    if [ "$updated_channel" != "$lower_no" ]; then
      textColor ${red} "打包分支修改失败，请至eas.json档确认"
      exit 0
    fi
    textColor ${green} "打包分支已修改为 $1"
  else
    sed -i '' -e "/\"preview\": {/,/}/s/\"channel\": \"[^\"]*\"/\"channel\": \"$1\"/" "$edit_eas"
    # 获取更新后的channel值
    updated_channel=$(sed -n '/"preview": {/,/}/p' "$edit_eas" | grep '"channel":' | awk -F'"' '{print $4}')
    # echo "Updated Preview channel: $updated_channel"
    # 检查是否有更换channel值
    if [ "$updated_channel" != "$1" ]; then
      textColor ${red} "打包分支修改失败，请至eas.json档确认"
      exit 0
    fi
    textColor ${green} "打包分支已修改为 $1"
  fi
fi

# 设定打包资料所在目录
data_dir=$HOME'/Downloads/'$1
if [[ "$HOME" == *"paul"* ]]; then
  package_data=$HOME'/Desktop/打包资料'
  data_dir=$(find "$package_data" -type d -name "$1")
  # echo $data_dir
fi
data_json=$data_dir'/'$1'.json'
icon1024=$data_dir'/icon1024.png'
startup=$data_dir'/startup.png'

# 检查目录是否存在
if [ ! -d $data_dir ]  > /dev/null; then
  textColor ${red} "$1 目录不存在，请确认下载路径是否有 $1 目录"
  exit 0
fi

# 检查是否有json档
if [ ! -f $data_json ]  > /dev/null; then
  textColor ${red} "没有json档，资料格式必须为json"
  exit 0
fi

# 获取josn档指定key的值
json=$(cat $data_json)
ios_url='https://'$(echo "$json" | grep -o '"domain_url": *"[^"]*"' | awk -F '"' '{print $4}')
if cat ${data_json} | grep '安卓' > /dev/null; then
  android_url='https://'$(echo "$json" | grep -o '"安卓": *"[^"]*"' | awk -F '"' '{print $4}')
else 
  android_url=$ios_url
fi
if [[ "$1" = "ZT031600000304" ]]; then
  build_id='com.ng.app.ngrn.'$1
else
  build_id='com.ng.app.ngssrn.'$1
fi
app_name=$(echo "$json" | grep -o '"app_name": *"[^"]*"' | awk -F '"' '{print $4}')

# 修改的文件 package.json
edit_file_json=${script_dir}'/package.json'
# 获取josn档指定key的值
version_json=$(cat $edit_file_json)
# 获取系统当天日期+001
time=$(date "+%y%m%d001")
# echo "("$time")"
version=$(echo "$version_json" | grep -o '"version": *"[^"]*"' | awk -F '"' '{print $4}')
# echo "version: $version"
new_version=${version%(*}"("$time")"
# echo "new_version: $new_version"
if cat ${edit_file_json} | grep $new_version > /dev/null; then
    textColor ${red} "app code已经是 $new_version ，跳过当前操作"
else
    sed -i "" "s/$version/$new_version/g" ${edit_file_json}
    textColor ${green} "app code已修改为 $new_version"
fi

textColor ${yellow} "--------------------打包资料参数检查--------------------"
textColor ${yellow} "打包资料路径：${data_dir}"
textColor ${yellow} "苹果域名：${ios_url}"
textColor ${yellow} "安卓域名：${android_url}"
textColor ${yellow} "用户名称：${app_name}"
textColor ${yellow} "包名：${build_id}"
textColor ${yellow} "版本号：${new_version}"

# 检查打包资料是否有对应图片并复制到工程/images
textColor ${black} "正在复制图片..."
if [ -f $icon1024 ]  > /dev/null; then
  cp $icon1024 $edit_image'/logo.png'
else
  textColor ${red} "没有1024尺寸icon图，图档名称必须为 icon1024.png"
  exit 0
fi
if [ -f $startup ]  > /dev/null; then
  cp $startup $edit_image'/splashscreen.png'
else
  textColor ${red} "没有1242x2688尺寸启动图，图档名称必须为 startup.png"
  exit 0
fi

# 替换资料方法
edit(){
  #判断是否为空值
  if [ "$1" = "DEFAULT" ]; then
    sed -i "" "s#const $3 = ''#const $3 = '$2'#g" ${edit_file}
    # sed -i "" "s/$1/$2/g" ${edit_file}
    textColor ${skybull} "工程资料已修改为 $2"
  elif
    cat ${edit_file} | grep $2 > /dev/null; then
    textColor ${red} "工程资料已经是 $2，跳过当前操作"
  else
    sed -i "" "s/$1/$2/g" ${edit_file}
    textColor ${skybull} "工程资料已修改为 $2"
  fi
}

# 替换域名资料方法
edit_url(){
  if cat ${edit_file} | grep $3 | grep $2 > /dev/null; then
    textColor ${red} "工程资料已经是 $2，跳过当前操作"
  else
    a="'$1'"
    b="'$2'"
    sed -i "" "s#const $3 = $a#const $3 = $b#g" ${edit_file}
    c=`get_js_data $3`
    if [ "$c" = "$1" ] > /dev/null; then
      textColor ${red} "修改失败，结束"
      exit 0
    else
      textColor ${skybull} "工程资料已修改为 $2"
    fi
  fi
}

#已不使用
# # 替换安卓 DomainModule.kt 文档域名
# edit_DomainModule_url(){
#   if cat ${edit_DomainModule} | grep $3 | grep $2 > /dev/null; then
#     textColor ${red} "DomainModule资料已经是 $2，跳过当前操作"
#   else
#     search_pattern="$3 = \"$1\""
#     new_value="$3 = \"$2\""
#     # 使用 sed 修改值
#     sed -i '' "s#$search_pattern#$new_value#g" "$edit_DomainModule"
#     c=$(grep "$3" "$edit_DomainModule" | awk -F'=' '{print $2}' | tr -d ' "')
#     # echo $c
#     if [ "$c" == "$1" ] > /dev/null; then
#       textColor ${red} "修改失败，结束"
#       exit 0
#     else
#       textColor ${skybull} "DomainModule资料已修改为 $2"
#     fi
#   fi
# }

# 修改打包资料代码
textColor ${skybull} '开始修改资料...'
textColor ${skybull}  "--------------------更新后资料参数--------------------"
edit_url $old_ios_url $ios_url 'DOMAIN_URL_IOS'
edit_url $old_android_url $android_url 'DOMAIN_URL_ANDROID'
edit $old_build_id $build_id 'BUNDLE_ID'
edit $old_app_name $app_name 'NAME'
#edit_DomainModule_url $old_DomainModule_url "$android_url" 'params\["getDomain"\]'