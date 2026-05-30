import { type TimeRange } from '@/types'
import { useEffect, useState } from 'react'
import { formatMoney } from '@/utils/utils'
import { useTranslation } from "react-i18next"
import { getAmountColor } from '@/utils/promotion'
import { getDirectChildFinance } from '@/api/post/promotion'
import { useTheme } from "@/hooks/theme/ThemeProvider"
import PageWrap from '@/components/promotion/PageWrap'
import SearchForm from '@/components/promotion/SearchForm'
import ContentList from '@/components/promotion/ContentList'
import TotalCard, { TotalCardItem } from '@/components/promotion/TotalCard'
import ContentCard, { Username, ContentCardItem } from '@/components/promotion/ContentCard'

interface Finance {
  uid: string
  username: string
  degreeName: string
  memberId: number
  cashMoney: number
  depositMoney: number
  withdrawMoney?: number
  withdrawTimes?: number
  depositDrawDiff?: number
  degreeLevel: number
  depositTimes: string
}
type Finances = Array<Finance>

let dataStorage = new Array()
const ChildFinance = () => {
  const { t } = useTranslation();
  const { themeColors: { primary, text } } = useTheme()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [queryTime, setQueryTime] = useState<TimeRange>()
  const [data, setData] = useState<Finances>([])

  const members = data.length
  const totalDeposit = data.reduce((total, { depositMoney }) => total += depositMoney, 0)
  const totalWithdraw = data.reduce((total, { withdrawMoney }) => total += (withdrawMoney ?? 0), 0)
  const totalDepositTimes = data.reduce((total, { depositTimes }) => total += Number(depositTimes), 0)

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange)
  function fetchData() {
    setLoading(true)
    getDirectChildFinance(queryTime)
      .then(({ data: { data } }) => {
        dataStorage = data
      }).catch(() => {
        dataStorage = []
      }).finally(() => {
        setData(dataStorage)
        setLoading(false)
      })
  }
  function onSearch() {
    const filterData = dataStorage.filter((Finance: Finance) => Finance.username.includes(username))
    setData(filterData)
  }

  useEffect(() => queryTime && fetchData(), [queryTime])

  return (
    <PageWrap titleKey='promotion.directFinancing'>
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        ListHeaderComponent={() => (
          <TotalCard>
            <TotalCardItem labelKey='promotion.rechargeMoneyAll' value={formatMoney(totalDeposit)} />
            <TotalCardItem labelKey='promotion.withdrawMoneyAll' value={formatMoney(totalWithdraw)} border />
            <TotalCardItem labelKey='promotion.depositTimes' value={totalDepositTimes} />
            <TotalCardItem labelKey='promotion.numberdirectRegistered' value={members} border />
          </TotalCard>
        )}
        renderItem={({ item }) => (
          <ContentCard>
            <Username username={item.username} />
            <ContentCardItem labelKey='UID' value={item.uid} />
            <ContentCardItem labelKey='promotion.grade' value={item.degreeName} />
            <ContentCardItem labelKey='home.deposit' value={formatMoney(item.depositMoney) + t('promotion.times', { number: item.depositTimes })} />
            <ContentCardItem labelKey='pageName.withdraw' value={formatMoney(item.withdrawMoney)} valueColor={primary} />
            <ContentCardItem labelKey='promotion.differencePrice' {...defineDifference(item.depositDrawDiff, text)} />
            <ContentCardItem labelKey='wallet.balance' value={formatMoney(item.cashMoney)} />
          </ContentCard>
        )}
        keyExtractor={item => item.uid}
      />
    </PageWrap>
  )
}

function defineDifference(money: number = 0, textColor: string) {
  let value = money > 0 ? '+' : ''
  value += formatMoney(money)

  return {
    value,
    valueColor: getAmountColor(money, textColor)
  }
}

export default ChildFinance
