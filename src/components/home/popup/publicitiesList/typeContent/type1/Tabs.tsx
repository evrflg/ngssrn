import { activeTheme } from "@/components/active/activeConfg";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { Publicity } from "@/types/publicity";
import { Icon } from "@rneui/base";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useTypeContentContext } from "../TypeContentContext";

interface TabsProps {
  activePublicityId?: string;
  onSelectPublicity: (publicity: Publicity) => void;
}

export function Tabs({
  activePublicityId,
  onSelectPublicity,
}: TabsProps) {
  const { publicities } = useTypeContentContext();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const activeIndex = publicities.findIndex((item) => item.id === activePublicityId);
    if (activeIndex < 0) {
      setStartIndex(0);
      return;
    }

    const pageStartIndex = Math.floor(activeIndex / 3) * 3;
    if (pageStartIndex !== startIndex) {
      setStartIndex(pageStartIndex);
    }
  }, [activePublicityId, publicities, startIndex]);

  const tabItems = useMemo(
    () =>
      publicities
        .map((item, index) => ({ ...item, sortNo: index }))
        .slice(startIndex, startIndex + 3),
    [publicities, startIndex],
  );

  const { isFirstPage, isLastPage, isOnlyOnePage } = useMemo(() => {
    const isFirstPage = startIndex === 0;
    const isLastPage = startIndex >= publicities.length - 4 && publicities.length > 0;
    const isOnlyOnePage = publicities.length <= 3;
    return { isFirstPage, isLastPage, isOnlyOnePage };
  }, [publicities.length, startIndex]);

  if (publicities.length <= 1) return null;

  return (
    <LinearGradient
      className="flex-row"
      colors={[
        activeTheme[theme].promotListBg.s,
        activeTheme[theme].promotListBg.e,
      ]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.tabConatainer}
    >
      {tabItems.map((publicity, index) => (
        <React.Fragment key={`tab-fragment-${publicity.sortNo}`}>
          <Pressable
            className="h-[40px] flex-1 tems-center justify-center flex-row items-center"
            onPress={() => onSelectPublicity(publicity)}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.publicityTitle,
                activePublicityId === publicity.id ? styles.active : undefined,
              ]}
            >
              {t("popup.publicitiesList.notificationWithIndex", {
                index: publicity.sortNo + 1,
              })}
            </Text>
          </Pressable>
          {index < tabItems.length - 1 && (
            <LinearGradient
              key={`border-${publicity.id}`}
              className="m-auto h-4/5 w-[1px]"
              style={styles.tabBorder}
              colors={[
                activeTheme[theme].tabBorder.s,
                activeTheme[theme].tabBorder.e,
                activeTheme[theme].tabBorder.s,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          )}
        </React.Fragment>
      ))}
      {!isFirstPage && !isOnlyOnePage && (
        <Pressable
          key="prev-btn"
          className="absolute left-[4px]"
          onPress={() => setStartIndex(startIndex - 3)}
        >
          <Icon
            type="simple-line-icon"
            name="arrow-left"
            size={16}
            color={activeTheme[theme].tabBorder.e}
          />
        </Pressable>
      )}
      {!isLastPage && !isOnlyOnePage && (
        <Pressable
          key="next-btn"
          className="absolute right-[4px]"
          onPress={() => setStartIndex(startIndex + 3)}
        >
          <Icon
            type="simple-line-icon"
            name="arrow-right"
            size={16}
            color={activeTheme[theme].tabBorder.e}
          />
        </Pressable>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  active: {
    fontWeight: "bold",
    color: "#fff",
  },
  tabConatainer: {
    borderBottomWidth: 0,
    display: "flex",
    flexDirection: "row",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
  },
  tabBorder: {
    width: 1,
    height: 26,
  },
  publicityTitle: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowRadius: 2,
    textShadowOffset: { width: 2, height: 2 },
    color: "#eaeaea",
  },
});
