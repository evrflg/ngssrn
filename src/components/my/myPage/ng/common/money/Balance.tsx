import React from "react"
import { Text, type TextProps } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { formatAmount } from "./format"

/**
 * 个人中心：主余额（组件内自行取数，不传金额值）
 * 仅渲染一个 Text，样式由外部传入 TextProps 控制
 */
export const BalanceText = React.memo(function BalanceText(props: TextProps) {
  const money = useSelector((state: RootState) => state?.user?.userInfo?.money)
  return <Text {...props}>{formatAmount(money)}</Text>
})
