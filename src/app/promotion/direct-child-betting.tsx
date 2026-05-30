import { getDirectChildBet } from "@/api/post/promotion";
import ProPopup from "@/components/active/components/propopup/ProPopup";
import { I18nText } from "@/components/I18nText";
import ContentCard, {
  ContentCardItem,
} from "@/components/promotion/ContentCard";
import ContentList from "@/components/promotion/ContentList";
import PageWrap from "@/components/promotion/PageWrap";
import SearchForm from "@/components/promotion/SearchForm";
import TotalCard, { TotalCardItem } from "@/components/promotion/TotalCard";
import { Colors } from "@/constants/Colors";
import { useCommon } from "@/hooks/CommonProvider";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { type TimeRange } from "@/types";
import { getAmountColor } from "@/utils/promotion";
import { formatMoney } from "@/utils/utils";
import Clipboard from "@react-native-clipboard/clipboard";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/common/toast";
import { Ionicons } from "@expo/vector-icons";

interface ChildBetting {
  uid: string;
  username: string;
  betTimes: string;
  degreeName: string;
  validBetAmount: number;
  memberWinLostAmount: number;
  statDate: [number, number, number]; // 投注时间 [年，余额，日]
}
type ChildBettingList = Array<ChildBetting>;

let dataStorage = new Array();

const DirectChildBetting = () => {
  const { theme } = useTheme();
  const { language } = useCommon();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [queryTime, setQueryTime] = useState<TimeRange>();
  const [data, setData] = useState<ChildBettingList>([]);
  const [currentItem, setCurrentItem] = useState<ChildBetting | null>(null);
  const toast = useToast();

  const totalValidBetAmount = data.reduce(
    (total, { validBetAmount }) => (total += validBetAmount),
    0
  );
  const totalWinLostAmount = data.reduce(
    (total, { memberWinLostAmount }) => (total += memberWinLostAmount),
    0
  );

  const copyToClipboard = async (text: string) => {
    console.log('text::', text);
    try {
      await Clipboard.setString(text);
      toast.success(t("common.copySuccess"));
    } catch (error) {
      console.error("复制失败:", error);
      toast.error(t("common.copyFailed"));
    }
  };

  const onConfirmTime = (timeRange: TimeRange) => setQueryTime(timeRange);
  function fetchData() {
    setLoading(true);
    getDirectChildBet(queryTime)
      .then(({ data: { data = [] } }) => {
        dataStorage = data || [];
      })
      .catch(() => {
        dataStorage = [];
      })
      .finally(() => {
        setData(dataStorage || []);
        setLoading(false);
      });
  }
  function onSearch() {
    if (username) {
      const filterData = dataStorage.filter((record: ChildBetting) =>
        record.username?.includes(username)
      );
      setData(filterData);
    } else {
      setData(dataStorage);
    }
  }
  function formatDate(dateArr: ChildBetting["statDate"]) {
    if (!dateArr) return "";

    const [year, month, day] = dateArr;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const yyyy = String(year);
    console.log('language::', language);
    switch (language) {
      case "CN": // 中文
      case "zh-CN": // 中文
      case "JP": // 日本语
        return `${yyyy}-${mm}-${dd}`;
      case "EN": // 英语
      case "PH": // 菲律宾语
        return `${mm}-${dd}-${yyyy}`;
      default: // 剩余语言
        return `${dd}-${mm}-${yyyy}`;
    }
  }

  useEffect(() => queryTime && fetchData(), [queryTime]);

  return (
    <PageWrap titleKey="promotion.directBetting">
      <SearchForm {...{ username, setUsername, onSearch, onConfirmTime }} />
      <ContentList
        isLoading={loading}
        data={data}
        ListHeaderComponent={() => (
          <TotalCard>
            <TotalCardItem
              labelKey="promotion.directlyValidBets"
              value={formatMoney(totalValidBetAmount)}
            />
            <TotalCardItem
              labelKey="promotion.winloseDirectly"
              value={formatMoney(totalWinLostAmount)}
              border
            />
          </TotalCard>
        )}
        renderItem={({ item }) => (
          <ContentCard>
            <View className={"flex-row flex-1 items-center gap-2 mb-1"}>
              <I18nText
                i18nKey="betRecord.username"
                className={`text-${theme}-text`}
              />
              <Text className={`text-${theme}-text text-xs font-bold`}>
                {item.username}
              </Text>
            </View>
            <ContentCardItem
              labelKey="promotion.grade"
              value={item.degreeName}
            />
            <ContentCardItem
              labelKey="promotion.directBetAllNum"
              value={item.betTimes}
            />
            <ContentCardItem
              labelKey="promotion.validBet"
              value={formatMoney(item.validBetAmount)}
            />
            <ContentCardItem
              labelKey="promotion.winLoseAmount"
              value={formatMoney(item.memberWinLostAmount)}
              valueColor={getAmountColor(item.memberWinLostAmount)}
            />
            <Pressable onPress={() => setCurrentItem(item)}>
              <ContentCardItem
                labelKey="betRecord.betDate"
                value={formatDate(item.statDate)}
                valueColor={Colors.lightFontColor}
                valueStyle={{
                  textDecorationLine: "underline",
                }}
              />
            </Pressable>
          </ContentCard>
        )}
        keyExtractor={(item) => item.uid}
      />
      <ProPopup
        title={currentItem?.uid ?? ""}
        visible={currentItem?.uid != null}
        onClose={() => setCurrentItem(null)}
        type="linear"
      >
        <View className="w-full p-4 mb-1 rounded-md"
          style={{ backgroundColor: Colors[theme].cardBg1 }}>
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].lightText }}>
              UID
            </Text>
            <View className="flex-row gap-2">
              <Text className="text-left self-start"
                style={{ fontSize: 13, color: Colors[theme].lightText }}>
                {currentItem?.uid}
              </Text>
              <Pressable
                onPress={() => {
                  if (currentItem?.uid) {
                    copyToClipboard(currentItem.uid.toString());
                  }
                }}
              >
                <Ionicons name="copy-outline" size={16} color={Colors[theme].lightText} />
              </Pressable>
            </View>

          </View>
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].lightText }}>
              {t("promotion.grade")}
            </Text>
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].text }}>
              {currentItem?.degreeName || ''}
            </Text>
          </View>
          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].lightText }}>
              {t("promotion.directBetAllNum")}
            </Text>
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].text }}>
              {currentItem?.betTimes}
            </Text>
          </View>

          <View className="w-full flex-row justify-between items-center mb-3">
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].lightText }}>
              {t("promotion.validBet")}
            </Text>
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].text }}>
              {formatMoney(currentItem?.validBetAmount ?? 0.00)}
            </Text>
          </View>

          <View className="w-full flex-row justify-between items-center">
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].lightText }}>
              {t("promotion.winLoseAmount")}
            </Text>
            <Text className="text-left self-start"
              style={{ fontSize: 13, color: Colors[theme].text }}>
              {formatMoney(currentItem?.memberWinLostAmount ?? 0.00)}
            </Text>
          </View>
        </View>
      </ProPopup>
    </PageWrap>
  );
};

export default DirectChildBetting;
