import { useEffect, useState } from "react";
import { formatMoney } from "@/utils/utils";
import { formatDateTime } from "@/utils/date";
import { getAllData } from "@/api/post/promotion";
import { type TimeRange } from "@/types";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import PageWrap from "@/components/promotion/PageWrap";
import SearchForm from "@/components/promotion/SearchForm";
import ContentList from "@/components/promotion/ContentList";
import TotalCard, { TotalCardItem } from "@/components/promotion/TotalCard";
import ContentCard, { Username, ContentCardItem } from "@/components/promotion/ContentCard";

interface Record {
  username: string;
  uid: string;
  degreeName: string;
  degreeLevel: number;
  validBetNum: number;
  allDeposit: number;
  createTime: number;
}
type Records = Array<Record>;

let dataStorage = new Array();
const AllData = () => {
  const {
    themeColors: { primary },
  } = useTheme();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [queryTime, setQueryTime] = useState<TimeRange>();
  const [data, setData] = useState<Records>([]);

  const totalDeposit = data.reduce((total, { allDeposit }) => (total += allDeposit), 0);
  const totalValidBet = data.reduce((total, { validBetNum }) => (total += validBetNum), 0);

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange);
  function fetchData() {
    setLoading(true);
    getAllData(queryTime)
      .then(({ data: { data } }) => {
        dataStorage = data.list;
      })
      .catch(() => {
        dataStorage = [];
      })
      .finally(() => {
        setData(dataStorage);
        setLoading(false);
      });
  }
  function onSearch() {
    const filterData = dataStorage.filter((record: Record) => record.username.includes(username));
    setData(filterData);
  }

  useEffect(() => queryTime && fetchData(), [queryTime]);

  return (
    <PageWrap titleKey="pageName.transactionRecord">
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        ListHeaderComponent={() => (
          <TotalCard>
            <TotalCardItem labelKey="promotion.lumpSum" value={formatMoney(totalDeposit)} />
            <TotalCardItem
              labelKey="promotion.totalValidBet"
              value={formatMoney(totalValidBet)}
              border
            />
          </TotalCard>
        )}
        renderItem={({ item }) => (
          <ContentCard>
            <Username username={item.username} />
            <ContentCardItem labelKey="UID" value={item.uid} />
            <ContentCardItem labelKey="promotion.grade" value={item.degreeName} />
            <ContentCardItem labelKey="promotion.validBet" value={formatMoney(item.validBetNum)} />
            <ContentCardItem
              labelKey="pageName.recharge"
              value={formatMoney(item.allDeposit)}
              valueColor={primary}
            />
            <ContentCardItem
              labelKey="common.time"
              value={formatDateTime(item.createTime)}
              valueColor="#aeb0c6"
            />
          </ContentCard>
        )}
        keyExtractor={(item) => item.createTime}
      />
    </PageWrap>
  );
};

export default AllData;
