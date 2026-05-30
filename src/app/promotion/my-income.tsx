import { type TimeRange, type TimeRangeUidParams } from '@/types'
import { formatMoney } from '@/utils/utils'
import { useCallback, useEffect, useState } from 'react'
import { formaDateFromArray, formatDate, getDateRange } from '@/utils/date'
import { getMyIncomeDataList, getMyIncomeAggsData } from '@/api/post/promotion'
import PageWrap from '@/components/promotion/PageWrap'
import SearchForm from '@/components/promotion/SearchForm'
import ContentList from '@/components/promotion/ContentList'
import TotalCard, { TotalCardItem } from '@/components/promotion/TotalCard'
import ContentCard, { Username, ContentCardItem } from '@/components/promotion/ContentCard'
import { useFocusEffect } from "expo-router";

interface IncomeRecord {
  amount: number
  userId: string
  username: string
  validBetNum: number
  statDate: number[]
}
interface TotalIncomeRecord {
  teamTotalBetNum: number
  teamDirectBetNum: number
  directBetPersons: string
  totalBetPersons: string
  totalRebateMoney: number
  directRebateMoney: number
}
type IncomeRecords = Array<IncomeRecord>

function getDefaultTodayTimeRange(): TimeRange {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { startTime, endTime } = getDateRange('today', tz)
  return [formatDate(startTime, tz), formatDate(endTime, tz)]
}

const MyIncome = () => {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [uid, setUid] = useState<string | undefined>(undefined)
  const [queryTime, setQueryTime] = useState<TimeRange>(() => getDefaultTodayTimeRange())
  const [data, setData] = useState<IncomeRecords>([])
  const [totalData, setTotalData] = useState<TotalIncomeRecord>({
    teamTotalBetNum: 0,
    teamDirectBetNum: 0,
    directBetPersons: '0',
    totalBetPersons: '0',
    totalRebateMoney: 0,
    directRebateMoney: 0
  })

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange)
  const [rangeStart, rangeEnd] = queryTime

  const fetchList = useCallback(async () => {
    setLoading(true)
    const params: TimeRangeUidParams = {
      queryTime: [rangeStart, rangeEnd],
      ...(uid != null && uid !== '' ? { uid } : {}),
    }
    try {
      const res = await getMyIncomeDataList(params)
      const list = (res?.data?.data?.list ?? []) as IncomeRecords
      if (uid != null && uid !== '') {
        setData(list.filter((r) => r.username.includes(uid)))
      } else {
        setData(list)
      }
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [rangeStart, rangeEnd, uid])

  const fetchAggs = useCallback(() => {
    getMyIncomeAggsData()
      .then(({ data: { data } }) => {
        if (data) setTotalData(data)
      })
      .catch(() => { })
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchAggs()
    }, [fetchAggs])
  )

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  function onSearch() {
    const next = username.trim()
    setUid(next === '' ? undefined : next)
  }

  return (
    <PageWrap titleKey='promotion.myIncome'>
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        ListHeaderComponent={() => (
          <TotalCard>
            <TotalCardItem labelKey='promotion.directBetMember' value={totalData?.directBetPersons} />
            <TotalCardItem labelKey='promotion.otherSubNum' value={+totalData?.totalBetPersons - +totalData?.directBetPersons} border />
            <TotalCardItem labelKey='promotion.directSubBetNum' value={formatMoney(totalData?.teamDirectBetNum)} />
            <TotalCardItem labelKey='promotion.otherSubBetNun' value={formatMoney(totalData?.teamTotalBetNum - totalData?.teamDirectBetNum)} border />
            <TotalCardItem labelKey='promotion.directSubMoney' value={formatMoney(totalData?.directRebateMoney)} />
            <TotalCardItem labelKey='promotion.otherSubMoney' value={formatMoney(totalData?.totalRebateMoney - totalData?.directRebateMoney)} border />
          </TotalCard>
        )}
        renderItem={({ item }) => (
          <ContentCard>
            <Username username={item.username} />
            <ContentCardItem labelKey='promotion.teamBetAmount' value={formatMoney(item.validBetNum)} />
            <ContentCardItem labelKey='promotion.commissionContribution' value={formatMoney(item.amount)} />
            <ContentCardItem labelKey='common.time' value={formaDateFromArray(item.statDate)} valueColor='#aeb0c6' />
          </ContentCard>
        )}
        keyExtractor={item => item.statDate.join() + item.userId}
      />
    </PageWrap>
  )
}

export default MyIncome
