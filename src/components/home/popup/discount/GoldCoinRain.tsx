import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

// 金币雨雪碧图，横向一排共 5 帧
const coinsImgUrl = require("@/assets/images/discount/coins-ani.png");

const TOTAL_FRAMES = 5;
const NUM_COINS = 26;

interface CoinConfig {
  id: number;
  x: number;
  y: number;
  scale: number;
  duration: number;
  driftDistance: number;
  initialFrame: number;
  frameDuration: number;
}

const IMAGE_INFO = {
  width: 100,
  height: 100,
  frameWidth: 20,
};

interface CoinProps {
  coin: CoinConfig;
  screenWidth: number;
  screenHeight: number;
  frameWidth: number;
}

function Coin({ coin, screenWidth, screenHeight, frameWidth }: CoinProps) {
  const positionX = useRef(new Animated.Value(coin.x)).current;
  const positionY = useRef(new Animated.Value(coin.y)).current;
  const [currentFrame, setCurrentFrame] = useState(coin.initialFrame);
  const motionAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameStarterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;

    // 每个金币独立循环，结束后立刻从顶部随机位置续上，避免一波结束后出现空窗期
    const startFall = (startX: number, startY: number) => {
      if (stoppedRef.current) return;

      positionX.setValue(startX);
      positionY.setValue(startY);

      // 续上时按实际起点计算本轮位移距离，避免从更高的位置重生后出现长时间看不到金币
      const travelDistance = screenHeight + 160 * coin.scale - startY;
      const travelDuration = Math.max(
        2200,
        Math.round((coin.duration * travelDistance) / (screenHeight + 160 * coin.scale)),
      );

      motionAnimationRef.current = Animated.parallel([
        Animated.timing(positionY, {
          toValue: screenHeight + 160 * coin.scale,
          duration: travelDuration,
          useNativeDriver: true,
        }),
        Animated.timing(positionX, {
          toValue: startX + coin.driftDistance,
          duration: travelDuration,
          useNativeDriver: true,
        }),
      ]);

      motionAnimationRef.current.start(({ finished }) => {
        if (!finished || stoppedRef.current) return;

        const nextX = Math.random() * screenWidth;
        // 下一轮不要重生得太高，否则会出现“第一波结束后空一会儿”的断层感
        const nextY = -(20 + Math.random() * 120);
        startFall(nextX, nextY);
      });
    };

    startFall(coin.x, coin.y);

    // 雪碧图按帧切换，不做连续位移，避免金币边缘被切坏
    frameStarterRef.current = setTimeout(() => {
      frameTimerRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % TOTAL_FRAMES);
      }, coin.frameDuration);
    }, Math.random() * coin.frameDuration);

    return () => {
      stoppedRef.current = true;
      motionAnimationRef.current?.stop();
      if (frameStarterRef.current) {
        clearTimeout(frameStarterRef.current);
        frameStarterRef.current = null;
      }
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
      }
    };
  }, [coin, positionX, positionY, screenHeight, screenWidth]);

  const spriteOffset = -currentFrame * frameWidth;

  return (
    <Animated.View
      style={[
        styles.coinContainer,
        {
          transform: [
            { translateX: positionX },
            { translateY: positionY },
            { scale: coin.scale },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.spriteContainer,
          {
            width: frameWidth,
            height: IMAGE_INFO.height,
          },
        ]}
      >
        <Animated.Image
          source={coinsImgUrl}
          style={{
            width: IMAGE_INFO.width,
            height: IMAGE_INFO.height,
            marginLeft: spriteOffset,
          }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
}

export const GoldCoinRain = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const coins = useMemo<CoinConfig[]>(
    () =>
      // 只在屏幕尺寸变化时重新生成金币初始数据
      Array.from({ length: NUM_COINS }, (_, index) => ({
        id: index,
        x: Math.random() * screenWidth,
        // 首屏就把金币分布到“屏幕内 + 屏幕上方”两个区域，避免刚出现时像卡一下才开始下
        y: Math.random() * screenHeight * 1.1 - screenHeight * 0.45,
        scale: 2.3 + Math.random() * 1.5,
        duration: 5200 + Math.random() * 2600,
        driftDistance: (Math.random() - 0.5) * 80,
        initialFrame: Math.floor(Math.random() * TOTAL_FRAMES),
        frameDuration: 120 + Math.random() * 90,
      })),
    [screenHeight, screenWidth],
  );

  return (
    <View
      className="gold-coin-rain"
      style={[styles.container, { width: screenWidth, height: screenHeight }]}
      pointerEvents="none"
    >
      {coins.map((coin) => (
        <Coin
          key={coin.id}
          coin={coin}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          frameWidth={IMAGE_INFO.frameWidth}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  coinContainer: {
    position: "absolute",
  },
  spriteContainer: {
    overflow: "hidden",
  },
});
