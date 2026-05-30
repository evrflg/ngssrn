import { type TimeRange } from '@/types'
import { formatMoney } from '@/utils/utils'
import { useEffect, useState } from 'react'
import PageWrap from '@/components/promotion/PageWrap'
import SearchForm from '@/components/promotion/SearchForm'
import { getDirectMemberData } from '@/api/post/promotion'
import ContentList from '@/components/promotion/ContentList'
import ContentCard, { Username, ContentCardItem } from '@/components/promotion/ContentCard'

interface ChildInfo {
  uid: string
  username: string
  memberId: string
  degreeName: string
  degreeLevel: number
  proxyRebateAmount: number
  activeAwardAmount: number
  taskAwardAmount: number
  totalDepositMoney?: number
}
type ChildInfos = Array<ChildInfo>

let dataStorage = new Array()
const DirectChild = () => {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [queryTime, setQueryTime] = useState<TimeRange>()
  const [data, setData] = useState<ChildInfos>([])

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange)
  function fetchData() {
    setLoading(true)
    getDirectMemberData(queryTime)
    .then(({ data: { data } }) => {
      dataStorage = data.list
    }).catch(() => {
      dataStorage = []
    }).finally(() => {
      setData(dataStorage)
      setLoading(false)
    })
  }
  function onSearch() {
    const filterData = dataStorage.filter((ChildInfo: ChildInfo) => ChildInfo.username.includes(username))
    setData(filterData)
  }

  useEffect(() => queryTime && fetchData(), [queryTime])

  return (
    <PageWrap titleKey='promotion.directSubordinate'>
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        renderItem={({ item }) => (
          <ContentCard>
            <Username username={item.username} />
            <ContentCardItem labelKey='UID' value={item.uid} />
            <ContentCardItem labelKey='promotion.grade' value={item.degreeName} />
            <ContentCardItem labelKey='promotion.activeAward' value={formatMoney(item.activeAwardAmount)} />
            <ContentCardItem labelKey='promotion.taskBonus' value={formatMoney(item.taskAwardAmount)} />
            <ContentCardItem labelKey='promotion.agencyCommission' value={formatMoney(item.proxyRebateAmount)} />
          </ContentCard>
        )}
        keyExtractor={item => item.uid}
      />
    </PageWrap>
  )
}

export default DirectChild
