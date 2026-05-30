import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TabView } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Modal from "react-native-modal";
import RenderHtml from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import FloatDrag from "./FloatDrag";
import { useMaxWidth } from "@/hooks/useMaxWidth";

export const tagsStyles = StyleSheet.create({
  li: {
    fontSize: 12,
    lineHeight: 22
  },
  b: {
    fontWeight: 700
  }
});

interface PropsType {
  showPage: number;
}

export type FloatAfsItem = {
  afrId: number;
  id: number;
  imgHoverUrl: string;
  imgSort: number;
  imgUrl: string;
  linkType: number;
  linkUrl: string;
};

export type FloatAdType = {
  id: number;
  showPosition: string;
  showPage: number;
  imgType: number;
  afsList: FloatAfsItem[];
};

interface AutoTabViewProps {
  data: FloatAdType;
  jump: (item: FloatAfsItem) => void;
  initialPosition: { x: number; y: number };
  floatStyle: object;
}

const AutoTabView = ({ data, jump, initialPosition, floatStyle }: AutoTabViewProps) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (data.imgType === 2 && data.afsList.length > 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % data.afsList.length);
      }, 3000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [data]);

  return (
    <FloatDrag
      key={`float-list-${data.id}`}
      initialPosition={initialPosition}
      style={[styles.floatDrag, floatStyle, styles.tabItem]}
    >
      <TabView
        value={index}
        onChange={setIndex}
        animationType="spring"
        containerStyle={{ overflow: "hidden" }}
      >
        {data.afsList.map((afsItem) => (
          <TabView.Item
            className="tabview-item"
            key={`float-item-${afsItem.id}`}
          >
            <View className="gap-1">
              <Pressable onPress={() => jump(afsItem)}>
                <Image
                  alt=""
                  source={{ uri: afsItem.imgUrl }}
                  style={styles.image}
                />
              </Pressable>
              {!!afsItem.imgHoverUrl && (
                <AutoTabViewTitle title={afsItem.imgHoverUrl} />
              )}
            </View>
          </TabView.Item>
        ))}
      </TabView>
    </FloatDrag>
  );
};

const AutoTabViewTitle = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={[Colors[theme].primary, Colors[theme].secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.titleBg}
    >
      <Text style={styles.title}>{title}</Text>
    </LinearGradient>
  );
};

interface RenderIFrameProps {
  item: FloatAfsItem | null;
}

const RenderIFrame = ({ item }: RenderIFrameProps) => {
  if (!item) return null;
  if (Platform.OS === "web")
    return <iframe src={item.linkUrl} style={{ minHeight: "50vh" }} />;

  return (
    <WebView
      source={{ uri: item.linkUrl }}
      javaScriptEnabled={true}
      onShouldStartLoadWithRequest={() => true}
      style={{ minHeight: "50vh" }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      originWhitelist={["*"]}
      startInLoadingState={false}
    />
  );
};

const FloatAds = ({ showPage }: PropsType) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { width, height } = useWindowDimensions();
  const { maxWidth } = useMaxWidth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [floatList] = useState<FloatAdType[]>([]); //浮窗列表数据
  const [iframeShow, setIframeShow] = useState<boolean>(false); //iframe 是否显示
  const [currentData, setCurrentData] = useState<FloatAfsItem | null>(null); //当前点击项的数据

  const positions: Record<string, { x: number; y: number }> = useMemo(() => {
    const left_top = { x: 0, y: insets.top };
    const left_middle_top = { x: 0, y: insets.top };
    const left_middle = { x: 0, y: insets.top };
    const left_middle_bottom = { x: 0, y: insets.top };
    const left_bottom = { x: 0, y: height };
    const right_top = { x: maxWidth, y: insets.top };
    const right_middle_top = { x: maxWidth, y: insets.top };
    const right_middle = { x: maxWidth, y: insets.top };
    const right_middle_bottom = { x: maxWidth, y: insets.top };
    const right_bottom = { x: maxWidth, y: height };
    const middle_top = { x: 0, y: insets.top };
    const middle_bottom = { x: 0, y: height };

    return {
      left_top,
      left_middle_top,
      left_middle,
      left_middle_bottom,
      left_bottom,
      right_top,
      right_middle_top,
      right_middle,
      right_middle_bottom,
      right_bottom,
      middle_top,
      middle_bottom,
    };
  }, [height, insets.top, maxWidth]);

  const floatStyles: Record<string, object> = useMemo(() => {
    const oneHeight = (height - 62 - insets.top - insets.bottom) / 5;
    const oneWidth = (maxWidth - 86) / 2;

    const left_top = { left: 0, top: 0 };
    const left_middle_top = { left: 0, top: oneHeight };
    const left_middle = { left: 0, top: oneHeight * 2 };
    const left_middle_bottom = { left: 0, top: oneHeight * 3 };
    const left_bottom = { left: 0, bottom: 62 };
    const right_top = { right: 0, top: 0 };
    const right_middle_top = { right: 0, top: oneHeight };
    const right_middle = { right: 0, top: oneHeight * 2 };
    const right_middle_bottom = { right: 0, top: oneHeight * 3 };
    const right_bottom = { right: 0, bottom: 62 };
    const middle_top = { left: oneWidth, top: 0 };
    const middle_bottom = { left: oneWidth, bottom: 62 };

    return {
      left_top,
      left_middle_top,
      left_middle,
      left_middle_bottom,
      left_bottom,
      right_top,
      right_middle_top,
      right_middle,
      right_middle_bottom,
      right_bottom,
      middle_top,
      middle_bottom,
    };
  }, [height, insets.top, insets.bottom, maxWidth]);

  const jump = (item: FloatAfsItem) => {
    if (!item.linkUrl) return;
    // 普通跳转
    if (item.linkType === 1) navigation.push(item.linkUrl);
    else if (item.linkType === 2) Linking.openURL(item.linkUrl);
    else if (item.linkType === 4) {
      setCurrentData(item);
      setIframeShow(true);
    }
  };

  return (
    <>
      <View className="absolute float-frames-list">
        {floatList.map((item) => {
          if (item.imgType === 2 && item.afsList.length > 1) {
            return (
              <AutoTabView
                key={`float-slider-${item.id}`}
                data={item}
                jump={jump}
                initialPosition={positions[item.showPosition]}
                floatStyle={floatStyles[item.showPosition]}
              />
            );
          }
          return (
            <FloatDrag
              key={`float-list-${item.id}`}
              initialPosition={positions[item.showPosition]}
              style={[styles.floatDrag, floatStyles[item.showPosition]]}
            >
              {item.afsList.map((afsItem) => (
                <View key={`float-item-${afsItem.id}`} className="gap-1">
                  <Pressable onPress={() => jump(afsItem)}>
                    <Image
                      alt=""
                      source={{ uri: afsItem.imgUrl }}
                      style={styles.image}
                    />
                  </Pressable>
                  {afsItem.imgHoverUrl && (
                    <AutoTabViewTitle title={afsItem.imgHoverUrl} />
                  )}
                </View>
              ))}
            </FloatDrag>
          );
        })}
      </View>
      <Modal
        animationIn={"slideInUp"}
        isVisible={iframeShow}
        backdropOpacity={0.5}
        className="bg-transparent border-0"
        animationOutTiming={100}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View
          className="flex-1 justify-center"
          style={{ width: Math.min(400, width * 0.9) }}
        >
          <LinearGradient
            colors={[Colors[theme].primary, Colors[theme].secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.popup, { minHeight: 450 }]}
          >
            {currentData?.imgHoverUrl && (
              <Text
                className="text-center"
                style={{
                  fontSize: 15,
                  marginBottom: 15,
                  color: Colors[theme].btnText,
                }}
              >
                {currentData.imgHoverUrl}
              </Text>
            )}
            {currentData?.linkUrl.includes("iframe") ? (
              <RenderHtml
                contentWidth={width}
                source={{ html: currentData.linkUrl }}
                tagsStyles={{ ...tagsStyles, iframe: { minHeight: "50vh" } }}
              />
            ) : (
              <RenderIFrame item={currentData} />
            )}
          </LinearGradient>
          <Pressable
            style={{ marginTop: 9, marginHorizontal: "auto" }}
            onPress={() => {
              setIframeShow(false);
              setCurrentData(null);
            }}
          >
            <Ionicons color={"#fff"} name={"close-circle-outline"} size={34} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatDrag: {
    gap: 5,
    padding: 7,
  },
  tabItem: {
    width: 86,
    height: 100,
  },
  image: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 12,
    lineHeight: 12,
    textAlign: "center",
    width: "fit-content",
  },
  titleBg: {
    padding: 3,
    borderRadius: 5,
    width: "fit-content",
    margin: "auto",
  },
  popup: {
    padding: 10,
    borderRadius: 10,
  },
  popupTitle: {
    fontSize: 15,
    marginBottom: 15,
  },
});

export default FloatAds;
