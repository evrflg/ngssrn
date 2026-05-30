#!/bin/bash

# 颜色变量
red=31m
green=32m
yellow=33m

# 颜色方法
function textColor() 
{ 
  echo -e "\033[${1}$2\033[0m"; 
}

# 获取当前项目的绝对路径
jDir=$(cd $(dirname $0);cd ..; pwd)
# 修改的文件 android
edit_file=${jDir}'/eas.json'

# 分支名称 eas.json preview 中的 channel
if [ $1 -eq 1 ]; then
  textColor ${yellow} "打包分支 ==> ces \n打包类型 ==> 测试包"
else
  textColor ${yellow} "打包分支 ==> line \n打包类型 ==> 正式包"
fi

# 判断文件不存在 终止进程
[ ! -e ${edit_file} ] && textColor ${red} "没有找到分支配置文件：${edit_file}\n进程已终止" && exit

edit(){
  if cat ${edit_file} | grep $2 > /dev/null; then
    textColor ${red} "分支名已经是 $2，跳过当前操作"
  else
    sed -i "" "s/$1/$2/g" ${edit_file}
    textColor ${green} "打包分支已修改为 $2"
  fi
}

# 修改分支名代码
textColor ${yellow} '正在修改分支名称...'
if [ $1 -eq 1 ]; then
  edit "line" "ces"
else
  edit "ces" "line"
fi