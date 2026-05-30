/**
 * 工具
 */
import React from 'react'
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native'
import RootSiblings from 'react-native-root-siblings'
import { Icon } from '@rneui/themed';
import { screen } from "@/utils/screen";
import { t } from "i18next";

const width = screen.get('window').width
const height = screen.get('window').height


let loadSibling: RootSiblings | undefined = undefined
let toastSibling: RootSiblings | undefined = undefined

type LoadProps = {
  maskStyle?: any //遮造视图样式
  contentStyle?: any //内容视图样式
}
type ToastProps = {
  duration?: number //显示时间
  maskStyle?: any //遮造视图样式
  contentStyle?: any //内容视图样式
  textStyle?: any //文本视图样式
  iconStyle?: any //提示图标样式
}

/**
 * 按指定数目分割数组
 * @param list 需要切割的数组
 * @param num 几个一组
 */
export const sliceArray = (list: any, num: number) => {
  if (list.length < num) {
    var arr = [[]];
    arr[0] = list;
    return arr;
  }
  let result = [];
  for (let i = 0, len = list.length; i < len; i += num) {
    result.push(list.slice(i, i + num));
  }
  return result;
}

/**
 * 小数点后保留位数
 * @param num 数字
 * @param wei 保留位数
 */
export const retainNum = (num: number, wei?: number) => {
  if (!isNaN(num) && String(num).indexOf(".") != -1) {
    if (!wei) wei = 2;
    var str = String(num).split('.');
    if (str[1]) {
      num = parseFloat(str[0] + '.' + str[1].substring(0, wei));
    }
  }

  return num;
}

/**
 * 去掉小数点后没用的0
 * @param num 数字
 */
export const removeTrailingZeros = (num: number | string) => {
  const retNum = retainNum(Number(num), 6)
  return Number(retNum).toString();
  // return Number(String(retNum).replace(/0*$/, '').replace(/\.$/, '')).valueOf();
}

/**
 * 计算和
 * @param arr 需要计算的数组
 */
// export const addSum = (arr: any) => {
//   var sum = 0;
//   if (arr.indexOf('?') == -1) {
//     sum = arr.reduce((x: number, y: number) => parseInt(x) + parseInt(y))
//   }
//   return sum;
// }

export const Loading = {
  show: (msg?: string, config?: LoadProps) => {
    if (loadSibling instanceof RootSiblings) {
      loadSibling.destroy()
    }

    loadSibling = new RootSiblings(
      <View style={[styles.maskView, config?.maskStyle]}>
        <View style={[styles.contentView, styles.loadCont, config?.contentStyle]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={[styles.showText, { marginTop: 15 }]}>{msg || t("common.loading")}</Text>
        </View>
      </View>
    )
  },
  hide: () => {
    if (loadSibling instanceof RootSiblings) {
      loadSibling.destroy()
    }
  }
}

export const Toast = {
  /**
   * toast 显示
   * @param msg toast 文本
   * @param param1 ToastProps
   */
  show: (msg: string, config?: ToastProps) => {
    if (toastSibling instanceof RootSiblings) {
      toastSibling.destroy()
    }

    toastSibling = new RootSiblings(
      <View style={[styles.maskView, config?.maskStyle]}>
        <View style={[styles.contentView, styles.toastCont, config?.contentStyle]}>
          {
            config?.iconStyle && <Icon
              name={config?.iconStyle.name}
              // type='FontAwesome'
              color={config?.iconStyle.color}
              size={22}
              style={{ marginRight: 12 }}
            />
          }
          <Text style={[styles.showText, config?.textStyle]}>{msg}</Text>
        </View>
      </View>
    )

    setTimeout(() => {
      if (toastSibling instanceof RootSiblings) {
        toastSibling.destroy()
      }
    }, config?.duration || 2000);
  },
  hide: () => {
    if (toastSibling instanceof RootSiblings) {
      toastSibling.destroy()
    }
  },
  success: (msg?: string, config?: ToastProps) => {
    Toast.show(msg || t("common.operationSuccess"), {
      contentStyle: styles.successCont,
      textStyle: styles.successText,
      iconStyle: { name: 'check-circle', color: '#079100' },
      ...config
    })
  },
  fail: (msg?: string, config?: ToastProps) => {
    Toast.show(msg || t("common.operationFailed"), {
      contentStyle: styles.failCont,
      textStyle: styles.failText,
      iconStyle: { name: 'cancel', color: '#E70000' },
      ...config
    })
  },
  warn: (msg?: string, config?: ToastProps) => {
    Toast.show(msg || '', {
      contentStyle: styles.warnCont,
      textStyle: styles.warnText,
      iconStyle: { name: 'info', color: '#fff' },
      ...config
    })
  },
}

const styles = StyleSheet.create({
  maskView: {
    position: 'absolute',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100000
  },
  contentView: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  loadCont: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 120,
    minHeight: 100,
    paddingVertical: 20
  },
  toastCont: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  showText: {
    color: '#fff',
    fontSize: 12
  },
  successCont: {
    backgroundColor: 'rgba(167, 237, 166, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '75%',
  },
  successText: {
    fontSize: 16,
    color: '#079100',
  },
  failCont: {
    backgroundColor: 'rgba(255, 198, 198, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '75%',
  },
  failText: {
    fontSize: 16,
    color: '#E70000',
  },
  warnCont: {
    backgroundColor: 'rgba(102, 102, 102, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '75%',
  },
  warnText: {
    fontSize: 16,
    color: '#fff',
  }
})

