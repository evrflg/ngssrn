import { memo } from "react";
import { Image } from "react-native";

const GAME_TYPE_ICON_MAP: Record<string, any> = {
  "1": require('@/components/icons/home/gameTypes/gameType3/1.png'),
  "2": require('@/components/icons/home/gameTypes/gameType3/2.png'),
  "3": require('@/components/icons/home/gameTypes/gameType3/3.png'),
  "4": require('@/components/icons/home/gameTypes/gameType3/4.png'),
  "6": require('@/components/icons/home/gameTypes/gameType3/6.png'),
  "7": require('@/components/icons/home/gameTypes/gameType3/7.png'),
  "8": require('@/components/icons/home/gameTypes/gameType3/8.png'),
  "21": require('@/components/icons/home/gameTypes/gameType3/21.png'),
  "22": require('@/components/icons/home/gameTypes/gameType3/22.png'),
  "23": require('@/components/icons/home/gameTypes/gameType3/23.png'),
  "24": require('@/components/icons/home/gameTypes/gameType3/24.png'),
  "25": require('@/components/icons/home/gameTypes/gameType3/25.png'),
  "26": require('@/components/icons/home/gameTypes/gameType3/26.png'),
  "98": require('@/components/icons/home/gameTypes/gameType3/recent.png'),
  "99": require('@/components/icons/home/gameTypes/gameType3/favorite.png'),
};

const GameTypeIcon3Component = ({ type }: any) => {
  const iconSource = GAME_TYPE_ICON_MAP[String(type)];
  if (!iconSource) return null;

  return (
    <Image
      style={{ width: 20, height: 20 }}
      source={iconSource}
      resizeMode="contain"
    />
  );
};

export const GameTypeIcon3 = memo(
  GameTypeIcon3Component,
  (prev, next) => prev.type === next.type
);