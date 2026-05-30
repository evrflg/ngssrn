#!/bin/sh

# 颜色变量
red=31m
green=32m
yellow=33m
skybull=36m

# 颜色方法
function textColor() 
{ 
  echo -e "\033[${1}$2\033[0m"; 
}

# 使用方法:
# step1: 将该脚本放在工程的根目录下（跟.xcworkspace文件or .xcodeproj文件同目录）
# step2: 根据情况修改下面的参数
# step3: 打开终端，执行脚本。（输入sh，然后将脚本文件拉到终端，会生成文件路径，然后enter就可）

# =============项目自定义部分(自定义好下列参数后再执行该脚本)=================== #

# 是否编译工作空间 (例:若是用Cocopods管理的.xcworkspace项目,赋值true;用Xcode默认创建的.xcodeproj,赋值false)
is_workspace="true"

# .xcworkspace的名字，如果is_workspace为true，则必须填。否则可不填

workspace_name="ngssnative"

# .xcodeproj的名字，如果is_workspace为false，则必须填。否则可不填
project_name=

# 指定项目的scheme名称（也就是工程的target名称），必填
scheme_name="ngssnative"

# 指定要打包编译的方式 : Release,Debug。一般用Release。必填
build_configuration="Release"

# method，打包的方式。方式分别为 development必填
method="development"

#  下面两个参数只是在手动指定Pofile文件的时候用到，如果使用Xcode自动管理Profile,直接留空就好
# (跟method对应的)mobileprovision文件名，需要先双击安装.mobileprovision文件.手动管理Profile时必填
mobileprovision_name=""

# 使用Node.js执行JavaScript文件，并通过管道捕获输出
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

# 项目的bundleID，手动管理Profile时必填  包名
bundle_identifier=$(node -e '
  var myVar = require("./appConfig/config.js").BUNDLE_ID;
  console.log(myVar);
')
# echo "bundle_identifier: $bundle_identifier"

# 指定输出ipa名称， ##号撷取，删除包名最后一个.左边字符，保留右边
#preview ces测试 或 production正式  
edit_file='eas.json'
if cat ${edit_file} | grep 'ces' > /dev/null; then
  ipa_name=${bundle_identifier##*.}'(ngssRN)测试'
else
  ipa_name=${bundle_identifier##*.}'(ngssRN)'
fi
#echo "ipa_name: $ipa_name"

# 获取当前脚本所在目录
script_dir=$(cd $(dirname $0);cd ..; pwd)
# 工程根目录
project_dir=${script_dir}'/ios'

# 获取系统当天日期+001
time=$(date "+%y%m%d001")
# echo "("$time")"


#注释多行
#((0))&&{ }

echo "--------------------脚本配置参数检查--------------------"
textColor ${yellow} "is_workspace=${is_workspace}"
textColor ${yellow} "workspace_name=${workspace_name}"
textColor ${yellow} "project_name=${project_name}"
textColor ${yellow} "scheme_name=${scheme_name}"
textColor ${yellow} "build_configuration=${build_configuration}"
textColor ${yellow} "method=${method}"
textColor ${yellow} "app_name=${app_name}"
textColor ${yellow} "mobileprovision_name=${mobileprovision_name}"

# =======================脚本的一些固定参数定义(无特殊情况不用修改)====================== #

# 时间
DATE=`date '+%Y%m%d_%H%M%S'`
# 指定输出导出文件夹路径
# export_path="$project_dir/Package/$scheme_name-$DATE"
export_path="$HOME/Desktop/$ipa_name"
# 指定输出归档文件路径
export_archive_path="$export_path/$scheme_name.xcarchive"
# 指定输出ipa文件夹路径
export_ipa_path="$export_path"
# 指定输出ipa名称
#ipa_name="${scheme_name}_${DATE}"
# 指定导出ipa包需要用到的plist配置文件的路径
export_options_plist_path="$project_dir/ExportOptions.plist"


echo "--------------------脚本固定参数检查--------------------"
textColor ${yellow} "project_dir=${project_dir}"
textColor ${yellow} "DATE=${DATE}"
textColor ${yellow} "export_path=${export_path}"
textColor ${yellow} "export_archive_path=${export_archive_path}"
textColor ${yellow} "export_ipa_path=${export_ipa_path}"
textColor ${yellow} "export_options_plist_path=${export_options_plist_path}"
textColor ${yellow} "ipa_name=${ipa_name}"

# =======================自动打包部分(无特殊情况不用修改)====================== #


echo "------------------------------------------------------"
textColor ${green} "开始构建项目"
# 进入项目工程目录
cd ${project_dir}

# 指定输出文件目录不存在则创建
if [ -d "$export_path" ] ; then
    echo $export_path
else
    mkdir -pv $export_path
fi

# 判断编译的项目类型是workspace还是project
if $is_workspace ; then
# 编译前清理工程
xcodebuild clean -workspace ${workspace_name}.xcworkspace \
                 -scheme ${scheme_name} \
                 -configuration ${build_configuration}

xcodebuild archive -workspace ${workspace_name}.xcworkspace \
                   -scheme ${scheme_name} \
                   -configuration ${build_configuration} \
                   -archivePath ${export_archive_path}
else
# 编译前清理工程
xcodebuild clean -project ${project_name}.xcodeproj \
                 -scheme ${scheme_name} \
                 -configuration ${build_configuration}

xcodebuild archive -project ${project_name}.xcodeproj \
                   -scheme ${scheme_name} \
                   -configuration ${build_configuration} \
                   -archivePath ${export_archive_path}
fi



#  检查是否构建成功
#  xcarchive 实际是一个文件夹不是一个文件所以使用 -d 判断
if [ -d "$export_archive_path" ] ; then
    textColor ${green} "项目构建成功 ✅  ✅  ✅  "
else
    textColor ${red} "项目构建失败 ❌  ❌  ❌  "
    exit 1
fi
echo "------------------------------------------------------"

textColor ${green} "开始导出ipa文件"


# 先删除export_options_plist文件
if [ -f "$export_options_plist_path" ] ; then
#    echo "${export_options_plist_path}文件存在，进行删除"
    rm -f $export_options_plist_path
fi
# 根据参数生成export_options_plist文件
/usr/libexec/PlistBuddy -c  "Add :method String ${method}"  $export_options_plist_path
/usr/libexec/PlistBuddy -c  "Add :provisioningProfiles:"  $export_options_plist_path
/usr/libexec/PlistBuddy -c  "Add :provisioningProfiles:${bundle_identifier} String ${mobileprovision_name}"  $export_options_plist_path

# 执行打包命令
xcodebuild  -exportArchive \
            -archivePath ${export_archive_path} \
            -exportPath ${export_ipa_path} \
            -exportOptionsPlist ${export_options_plist_path} \
            -allowProvisioningUpdates

## 检查ipa文件是否存在
echo "开始检查是否存在ipa"
echo "$export_ipa_path/$app_name.ipa"
if [ -f "$export_ipa_path/$app_name.ipa" ] ; then
    textColor ${green} "exportArchive ipa包成功,准备进行重命名"
else
    textColor ${red} "mexportArchive ipa包失败 ❌  ❌  ❌  "
    exit 1
fi

# 修改ipa文件名称
mv $export_ipa_path/"$app_name".ipa $export_ipa_path/$ipa_name.ipa
echo "ipa文件 $export_ipa_path/$app_name.ipa"
echo "已经修改ipa文件 $export_ipa_path/$ipa_name.ipa"

## 检查文件是否存在
if [ -f "$export_ipa_path/$ipa_name.ipa" ] ; then
    textColor ${green} "导出 ${ipa_name}.ipa 包成功  ✅  ✅  ✅  "
    open $export_path
else
    textColor ${red} "导出 ${ipa_name}.ipa 包失败  ❌  ❌  ❌  "
    exit 1
fi

# 删除export_options_plist文件（中间文件）
if [ -f "$export_options_plist_path" ] ; then
    #echo "${export_options_plist_path}文件存在，准备删除"
    rm -f $export_options_plist_path
fi
 
# 输出打包总用时
textColor ${yellow} "打包总用时: ${SECONDS}s"
open $export_ipa_path

exit 0