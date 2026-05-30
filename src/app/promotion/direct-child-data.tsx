import { type TimeRange } from '@/types'
import { useEffect, useState } from 'react'
import { formatDateTime } from '@/utils/date'
import { getDictData } from '@/api/common/dict'
import { getDirectChildData } from '@/api/post/promotion'
import { defineOnlineStatus } from '@/utils/promotion'
import PageWrap from '@/components/promotion/PageWrap'
import SearchForm from '@/components/promotion/SearchForm'
import ContentList from '@/components/promotion/ContentList'
import ContentCard, { Username, ContentCardItem } from '@/components/promotion/ContentCard'

interface RegisterSource {
  id: string
  label: string
  value: string
}
interface ChildInfo {
  uid: string
  username: string
  memberId: string
  proxyName: string
  groupName: string
  degreeName: string
  registSource: number
  onlineStatus: number
  lastLoginDatetime: number
}
type ChildInfos = Array<ChildInfo>

let dataStorage = new Array()
const ChildData = () => {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [queryTime, setQueryTime] = useState<TimeRange>()
  const [registerSources, setRegisterSource] = useState<RegisterSource[]>([])
  const [data, setData] = useState<ChildInfos>([])

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange)
  function fetchData() {
    setLoading(true)
    getDirectChildData(queryTime)
      .then(({ data: { data } }) => {
        dataStorage = data.list
      }).catch(() => {
        dataStorage = []
      }).finally(() => {
        setData(dataStorage)
        setLoading(false)
      })
  }
  function defineRegisterSource(value: number): string {
    const target = registerSources.find(source => +source.value === value)
    return target?.label ?? '-'
  }
  function onSearch() {
    const filterData = dataStorage.filter((ChildInfo: ChildInfo) => ChildInfo.username.includes(username))
    setData(filterData)
  }

  useEffect(() => queryTime && fetchData(), [queryTime])
  useEffect(() => {
    getDictData('member_source_flag').then(({ data: { data } }) => {
      setRegisterSource(data)
    })
  }, [])

  return (
    <PageWrap titleKey='promotion.directData'>
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        renderItem={({ item }) => (
          <ContentCard>
            <Username username={item.username} />
            <ContentCardItem labelKey='UID' value={item.uid} />
            {/* <ContentCardItem labelKey='promotion.groupName' value={item.groupName} /> */}
            <ContentCardItem labelKey='promotion.grade' value={item.degreeName} />
            <ContentCardItem labelKey='promotion.registerSource' value={defineRegisterSource(item.registSource)} />
            <ContentCardItem labelKey='promotion.onlineStatus' {...defineOnlineStatus(item.onlineStatus)} />
            <ContentCardItem labelKey='promotion.lastLogin' value={formatDateTime(item.lastLoginDatetime)} valueColor='#aeb0c6' />
          </ContentCard>
        )}
        keyExtractor={item => item.memberId}
      />
    </PageWrap>
  )
}

export default ChildData
