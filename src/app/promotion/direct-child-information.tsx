import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { formatMoney } from '@/utils/utils'
import { getDirectChildInfo, getDirectChildTotalInfo } from '@/api/post/promotion'
import { type TimeRange } from '@/types'
import { useTheme } from "@/hooks/theme/ThemeProvider"
import PageWrap from '@/components/promotion/PageWrap'
import SearchForm from '@/components/promotion/SearchForm'
import ContentList from '@/components/promotion/ContentList'
import TotalCard, { TotalCardItem } from '@/components/promotion/TotalCard'
import ContentCard, { Username, ContentCardItem } from '@/components/promotion/ContentCard'
import { defineAccountStatus } from '@/utils/promotion'

interface TotalIncomeRecord {
  totalDepositMoney: number
  directDepositMoney: number
  totalValidBetNum: number
  directValidBetNum: number
  directDepositPersons: string
  totalDepositPersons: string
}
interface ChildInformation {
  uid: string
  username: string
  betTimes: string
  degreeName: string
  accStatus: number
  validBetNum: number
  totalDepositMoney: number
  directMembers: number
}
type ChildInformationList = Array<ChildInformation>
let dataStorage = new Array()

const DirectChildInformation = () => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [queryTime, setQueryTime] = useState<TimeRange>()
  const [data, setData] = useState<ChildInformationList>([])
  const [totalData, setTotalData] = useState<TotalIncomeRecord>({
    totalDepositMoney: 0.00,
    directDepositMoney: 0.00,
    totalValidBetNum: 0,
    directValidBetNum: 0,
    directDepositPersons: '0',
    totalDepositPersons: '0'
  })
  const otherDepositTotal = formatMoney(totalData?.totalDepositMoney - totalData?.directDepositMoney)
  const otherDepositPeople = +totalData?.totalDepositPersons - +totalData?.directDepositPersons
  const otherValidBets = formatMoney(totalData?.totalValidBetNum - totalData?.directValidBetNum)
  const borderStyle = 'w-28 h-[1px] ' + (theme === 'greenBlack' ? 'bg-[#759163]' : 'bg-[#d9edfe]')

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange)
  function fetchData() {
    setLoading(true)
    getDirectChildInfo(queryTime)
      .then(({ data: { data = {} } }) => {
        dataStorage = data.list || []
      }).catch(() => {
        dataStorage = []
      }).finally(() => {
        setData(dataStorage)
        setLoading(false)
      })
  }
  function fetchTotalData() {
    getDirectChildTotalInfo().then(({ data: { data } }) => {
      data && setTotalData(data)
    })
  }
  function onSearch() {
    if (username) {
      const filterData = dataStorage.filter((record: ChildInformation) => record.username?.includes(username))
      setData(filterData)
    } else {
      setData(dataStorage)
    }
  }

  useEffect(() => {
    fetchData()
    fetchTotalData()
  }, [])
  useEffect(() => queryTime && fetchData(), [queryTime])

  return (
    <PageWrap titleKey='promotion.directBetInformation'>
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        contentContainerClassName='flex-1'
        noDataClass='flex-1'
        ListHeaderComponent={() => (
          <TotalCard>
            <View className='flex-1'>
              <View className='flex flex-row items-center'>
                <View className='w-1/2'>
                  <View className='w-full items-center'>
                    <TotalCardItem labelKey='promotion.directDepositTotal' value={formatMoney(totalData?.directDepositMoney)} className='w-full' />
                    <TotalCardItem labelKey='promotion.otherDepositTotal' value={otherDepositTotal} className='w-full' />
                  </View>
                </View>
                <View className='w-1/2'>
                  <TotalCardItem labelKey='promotion.rechargeAll' value={formatMoney(totalData?.totalDepositMoney)} className='w-full' border />
                </View>
              </View>

              <View className='flex flex-row justify-around'>
                <View className={borderStyle} />
                <View className={borderStyle} />
              </View>
              <View className='flex flex-row items-center'>
                <View className='w-1/2'>
                  <View className='w-full items-center'>
                    <TotalCardItem labelKey='promotion.directRechargeAllPeople' value={totalData?.directDepositPersons} className='w-full' />
                    <TotalCardItem labelKey='promotion.otherDepositPeople' value={otherDepositPeople} className='w-full' />
                  </View>
                </View>
                <View className='w-1/2'>
                  <TotalCardItem labelKey='promotion.totalRecharge' value={totalData?.totalDepositPersons} className='w-full' border />
                </View>
              </View>
              <View className='flex flex-row justify-around'>
                <View className={borderStyle} />
                <View className={borderStyle} />
              </View>
              <View className='flex flex-row items-center'>
                <View className='w-1/2'>
                  <View className='w-full items-center'>
                    <TotalCardItem labelKey='promotion.directlyValidBets' value={formatMoney(totalData?.directValidBetNum)} className='w-full' />
                    <TotalCardItem labelKey='promotion.otherValidBets' value={otherValidBets} className='w-full' />
                  </View>
                </View>
                <View className='w-1/2'>
                  <TotalCardItem labelKey='promotion.totalValidBet' value={formatMoney(totalData?.totalValidBetNum)} className='w-full' border />
                </View>
              </View>
            </View>
          </TotalCard>
        )}
        renderItem={({ item }) => (
          <ContentCard>
            <Username username={item.username} />
            <ContentCardItem labelKey='promotion.grade' value={item.degreeName} />
            <ContentCardItem labelKey='pageName.recharge' value={formatMoney(item.totalDepositMoney)} />
            <ContentCardItem labelKey='promotion.validBet' value={formatMoney(item.validBetNum)} />
            <ContentCardItem labelKey='common.statusText' {...defineAccountStatus(item.accStatus)} />
            <ContentCardItem labelKey='promotion.directSubordinate' value={item.directMembers} />
          </ContentCard>
        )}
        keyExtractor={item => item.uid}
      />
    </PageWrap>
  )
}

export default DirectChildInformation
