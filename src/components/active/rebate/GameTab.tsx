//游戏栏目组件
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, Pressable, FlatList, Platform } from "react-native";
import BuyuIcon from '@/components/icons/active/rebate/fishing.svg'
import CaipiaoIcon from '@/components/icons/active/rebate/lottery.svg'
import DianziIcon from '@/components/icons/active/rebate/slot.svg'
import QipaiIcon from '@/components/icons/active/rebate/card.svg'
import ZhenrenIcon from '@/components/icons/active/rebate/TV.svg'
import TiyuIcon from '@/components/icons/active/rebate/sport.svg'
import DianjingIcon from '@/components/icons/active/rebate/game.svg'
import { rebateTheme } from "@/components/active/components/activeConfg";
import { getGameType, getEffectiveGameType } from "@/api";
import { useToast } from "@/components/common/toast";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Colors } from "@/constants/Colors";

export const formatKickback = (minBet: number, kickback: number): number => {
  const value = (minBet * kickback) / 100;
  const factor = Math.pow(10, 5);
  return Math.floor(value * factor) / factor;
};

interface GameTabProps {
  onTabClick: (tabType: any) => void;
}

const gameIcons = new Map<number, any>([
  [1, ZhenrenIcon],
  [2, DianziIcon],
  [3, BuyuIcon],
  [4, TiyuIcon],
  [6, QipaiIcon],
  [7, DianjingIcon],
  [8, CaipiaoIcon],
]);
const GameTab: React.FC<GameTabProps> = ({ onTabClick }) => {
  const [gameTabList, setGameTabList] = useState<any>([]);
  const [selectIndex, setSelectIndex] = useState<number>(0);
  const [hasInit, setHasInit] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const scrollXRef = useRef(0);
  const toast = useToast();
  const { theme } = useTheme();
  const cardWidth = 624 / 6;
  useEffect(() => {
    fetchTabList();
  }, []);

  //根据 icon 重设 type
  const fetchTabList = async () => {
    toast.loading(true);
    try {
      const [res, effectiveRes] = await Promise.all([
        getGameType({ type: "game_type" }),
        getEffectiveGameType(),
      ]);

      if (res.data.code == 0 && effectiveRes.data.code == 0) {
        const filteredData = effectiveRes.data.data
          .map((value: number) => {
            return res.data.data.find(
              (tab: any) => tab.value === value.toString(),
            );
          })
          .filter(Boolean);

        setGameTabList(filteredData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      toast.loading(false);
    }
  };

  useEffect(() => {
    if (!hasInit && gameTabList.length > 0) {
      onTabClick(gameTabList[0]);
      setHasInit(true);
    }
  }, [gameTabList, hasInit]);

  return (
    <View className="flex-1 p-2">
      <FlatList
        horizontal={true}
        ref={flatListRef}
        data={gameTabList}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="hide-scrollbar"
        keyExtractor={(item) => item.id.toString()}
        style={{ width: "100%" }}
        onScroll={(event) => {
          scrollXRef.current = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        {...(Platform.OS === "web"
          ? ({
              onWheel: (event: any) => {
                const deltaX = Number(event?.deltaX ?? 0);
                const deltaY = Number(event?.deltaY ?? 0);
                const horizontalDelta =
                  Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
                if (!horizontalDelta || !flatListRef.current) return;

                event?.preventDefault?.();
                const nextOffset = Math.max(0, scrollXRef.current + horizontalDelta);
                flatListRef.current.scrollToOffset({
                  offset: nextOffset,
                  animated: false,
                });
                scrollXRef.current = nextOffset;
              },
            } as any)
          : {})}
        contentContainerStyle={{
          backgroundColor: rebateTheme[theme].content,
          borderRadius: 8,
          flexGrow: 1,
          minWidth: "100%",
          justifyContent: "space-between",
        }}
        getItemLayout={(data, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const Icon = gameIcons.get(Number(item.value));
          const isSelected = selectIndex === index;
          return (
            <Pressable
              style={styles.tabItem}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
                onTabClick(item);
                setSelectIndex(index);
              }}
            >
              <View style={styles.linearItem}>
                {Icon && (
                  <Icon
                    width={18}
                    height={18}
                    color={
                      isSelected
                        ? Colors[theme].primary
                        : "rgba(198, 202, 241, 1)"
                    }
                  />
                )}
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{
                    textAlign: "center",
                    fontSize: isSelected ? 12 : 11,
                    color: isSelected
                      ? rebateTheme[theme].text.a
                      : rebateTheme[theme].text.b,
                  }}
                >
                  {item.label}
                </Text>
              </View>
              <View
                className="rounded-lg w-1/2 py-0.5"
                style={{
                  backgroundColor: isSelected
                    ? Colors[theme].primary
                    : rebateTheme[theme].content,
                }}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    borderRadius: 8,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  linearItem: {
    minWidth: 78,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "auto",
    overflow: "hidden",
  },
  downloadButton: {
    width: 60,
    height: 23,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GameTab;
