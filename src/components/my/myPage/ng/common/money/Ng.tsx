import React from "react"
import { Text, type TextProps } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { formatAmount } from "./format"

/**
 * 个人中心：NG/虚拟币余额（组件内自行取数，不传金额值）
 * 仅渲染一个 Text，样式由外部传入 TextProps 控制
 */
export const NgText = React.memo(function NgText(props: TextProps) {
  const coin = useSelector((state: RootState) => {
    const ui = state?.user?.userInfo
    return ui?.cryptCoin ?? 0
  })
  return <Text {...props}>{formatAmount(coin)}</Text>
})
