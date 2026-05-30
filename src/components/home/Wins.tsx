import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "@rneui/base";
import { getWinsDataServer } from "@/api";
import { useFocusEffect } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { goToThreeGame } from "@/components/home/utils/util";
import { useToast } from "@/components/common/toast";
import Carousel from "react-native-reanimated-carousel";
const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = 64;
const CARD_GAP = 6;
const ITEM_STRIDE = CARD_WIDTH + CARD_GAP; // card width + gap

type WinItem = {
  gameId?: string | number;
  username?: string;
  amount?: string | number;
  gameIcon?: string;
};

const WinCard = React.memo(function WinCard({
  item,
  index,
  onPress,
  lightTextColor,
  primaryColor,
}: {
  item: WinItem;
  index: number;
  onPress: (item: WinItem) => void;
  lightTextColor: string;
  primaryColor: string;
}) {
  const img = item?.gameIcon;

  return (
    <View style={styles.cardList}>
      <Pressable onPress={() => onPress(item)} style={styles.card}>
        <View style={styles.cardImg}>
          <Image
            style={styles.cardImg}
            resizeMethod={"scale"}
            resizeMode={"stretch"}
            source={
              img ? { uri: img } : require("@/assets/images/home/winsdefault.png")
            }
          />
        </View>
        <Text
          className="flex justify-center items-center font-medium mt-1"
          style={[styles.userText, { color: lightTextColor }]}
        >
          {item?.username}
        </Text>
        <Text
          className="flex justify-center items-center font-medium mt-1"
          style={[styles.amountText, { color: primaryColor }]}
        >
          {item?.amount}
        </Text>
      </Pressable>
    </View>
  );
});

export const Wins = () => {
  const { theme } = useTheme(); //主题
  const userInfo: any = useSelector(
    (state: RootState) => state?.user?.userInfo
  );
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [dataList, setDataList] = useState([]);
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const lastWinsFetchRef = useRef(0);
  const toast = useToast();
  const isLogin = !!userInfo?.isLogin;
  const lightTextColor = Colors[theme].lightText;
  const primaryColor = Colors[theme].primary;
  const textColor = Colors[theme].text;
  const visibleWidth = useMemo(() => Math.max(0, screenWidth - 24), []);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const time = now - lastWinsFetchRef.current;

      if (time < 30000) {
        // 30秒内已有数据，不重新请求
        return;
      }
      lastWinsFetchRef.current = now;
      let cancelled = false;

      getWinsDataServer({})
        .then((res: any) => {
          // 若已 unfocus，忽略结果，避免在清理后启动新计时器
          if (cancelled) return;
          if (res?.data?.data) {
            let arr = res.data.data;
            if (arr.length > 5 && arr.length < 10) {
              arr = [...arr, ...arr];
            }
            setDataList(arr);
          }
        })
        .catch(() => {
          // ignore
        });
      return () => {
        cancelled = true;
      };
    }, [dataList])
  );

  //登录
  const toLogin = useCallback(() => {
    navigation.navigate("login");
  }, [navigation]);

  const goToGame = useCallback(
    (item: any) => {
      //直接跳转
      goToThreeGame(item?.gameId, item, dispatch, userInfo, toast, t);
    },
    [dispatch, navigation, toast, t]
  );

  const handleCardPress = useCallback(
    (item: WinItem) => {
      if (isLogin) {
        goToGame(item);
      } else {
        toLogin();
      }
    },
    [goToGame, isLogin, toLogin]
  );

  // Memoize rendered items to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return dataList?.map((item: WinItem, index: number) => (
      <WinCard
        key={`${item?.gameId || item?.username || index}-${index}`}
        item={item}
        index={index}
        onPress={handleCardPress}
        lightTextColor={lightTextColor}
        primaryColor={primaryColor}
      />
    ));
  }, [dataList, handleCardPress, lightTextColor, primaryColor]);

  const shouldAutoPlay = dataList.length >= 7;

  return dataList?.length > 0 ? (
    <View style={styles.container}>
      <View className="justify-left items-center flex-row" style={styles.title}>
        <View
          className="rounded-md w-2 h-2 mr-1"
          style={{ backgroundColor: primaryColor }}
        ></View>
        <Text
          className="font-medium"
          style={[styles.titleText, { color: textColor }]}
        >
          {t("home.recentBigWins")}
        </Text>
      </View>
      <View style={styles.cardBox}>
        <Carousel
          width={ITEM_STRIDE}
          height={132}
          style={{ width: visibleWidth }}
          data={dataList}
          loop={shouldAutoPlay}
          autoPlay={shouldAutoPlay}
          autoPlayInterval={1500}
          scrollAnimationDuration={500}
          enabled={dataList.length > 1}
          renderItem={({ item, index }) => (
            <WinCard
              item={item as WinItem}
              index={index}
              onPress={handleCardPress}
              lightTextColor={lightTextColor}
              primaryColor={primaryColor}
            />
          )}
        />
      </View>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    // borderWidth: 1,
    // borderColor: 'red',
    paddingHorizontal: 12,
    marginTop: 10,
  },
  title: {
    height: 30,
  },
  cardBox: {
    height: 132,
    overflow: "hidden",
  },
  cardList: {
    width: 64,
    height: 132,
    marginRight: 6,
  },
  card: {
    height: 132,
    width: 64,
  },
  cardImg: {
    height: 88,
    width: 64,
    borderRadius: 8,
  },
  userText: {
    fontSize: 10,
  },
  amountText: {
    fontSize: 10,
    fontWeight: "600",
  },
  titleText: {
    fontSize: 13,
  },
});
