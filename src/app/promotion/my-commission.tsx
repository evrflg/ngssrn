import { type TimeRange } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { formatMoney } from '@/utils/utils'
import { getMyCommission, getMyCommissionStats } from '@/api/post/promotion'
import { formatDate, getDateRange } from '@/utils/date'
import { useTheme } from "@/hooks/theme/ThemeProvider"
import PageWrap from '@/components/promotion/PageWrap'
import ContentList from '@/components/promotion/ContentList'
import DateRangePicker from "@/components/common/DateRangePicker"
import TotalCard, { TotalCardItem } from '@/components/promotion/TotalCard'
import ContentCard, { ContentCardItem } from '@/components/promotion/ContentCard'

interface CommissionRecord {
  totalAwardMoney: number
  rebateMoney: number
  createDate: number[]
}
type CommissionRecords = Array<CommissionRecord>

interface MyCommissionStatsPayload {
  totalAwardMoney?: unknown
  rebateMoney?: unknown
  totalRebateMoney?: unknown
}

function getDefaultTodayTimeRange(): TimeRange {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { startTime, endTime } = getDateRange('today', tz)
  return [formatDate(startTime, tz), formatDate(endTime, tz)]
}

function toStatNum(v: unknown): number {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const MyCommission = () => {
  const { themeColors: { primary, text } } = useTheme();
  const [loading, setLoading] = useState(true)
  const [queryTime, setQueryTime] = useState<TimeRange>(() => getDefaultTodayTimeRange())
  const [data, setData] = useState<CommissionRecords>([])
  const [totalData, setTotalData] = useState({ awardMoney: 0, rebateMoney: 0 })

  const [rangeStart, rangeEnd] = queryTime

  const loadPage = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, listRes] = await Promise.all([
        getMyCommissionStats({ queryTime }),
        getMyCommission(queryTime),
      ])
      const stats = statsRes.data?.data as MyCommissionStatsPayload | null | undefined
      if (!stats) {
        setTotalData({ awardMoney: 0, rebateMoney: 0 })
      } else {
        setTotalData({
          awardMoney: toStatNum(stats.totalAwardMoney),
          rebateMoney: toStatNum(stats.rebateMoney ?? stats.totalRebateMoney),
        })
      }
      const listBody = listRes.data?.data
      setData((listBody?.list ?? []) as CommissionRecords)
    } catch {
      setTotalData({ awardMoney: 0, rebateMoney: 0 })
      setData([])
    } finally {
      setLoading(false)
    }
  }, [rangeStart, rangeEnd])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  return (
    <PageWrap titleKey='promotion.myCommission'>
      <DateRangePicker style={{ marginBottom: 12 }} onConfirm={setQueryTime} showLabel />
      <ContentList
        style={{ flex: 1 }}
        noDataClass='flex-1'
        isLoading={loading}
        data={data}
        ListHeaderComponent={() => (
          <TotalCard>
            <TotalCardItem labelKey='promotion.totalAwardMoney' value={formatMoney(totalData.awardMoney)} />
            <TotalCardItem labelKey='agent.proxyRebateAmount' value={formatMoney(totalData.rebateMoney)} border />
          </TotalCard>
        )}
        renderItem={({ item }) => (
          <ContentCard>
            <ContentCardItem labelKey='promotion.awardMoney' value={formatMoney(item.totalAwardMoney)} valueColor={text} />
            <ContentCardItem labelKey='promotion.rebateMoney' value={formatMoney(item.rebateMoney)} valueColor={primary} />
            <ContentCardItem labelKey='promotion.calcTime' value={item.createDate.join('-')} valueColor='#aeb0c6' />
          </ContentCard>
        )}
        keyExtractor={item => item.createDate.join()}
      />
    </PageWrap>
  )
}

export default MyCommission
