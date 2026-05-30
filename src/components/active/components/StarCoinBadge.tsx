import React, { memo, useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import StarCoinSvg from "@/assets/images/active/star_coin.svg";

type Props = {
  compact?: boolean;
};

const SPOKES = 8;

export const StarCoinBadge = memo(function StarCoinBadge({ compact = false }: Props) {
  // compact 稍微放大一档（更接近 Web 端视觉）
  const ringR = compact ? 8 : 10;
  const bulb = compact ? 3 : 4;
  const star = compact ? 14 : 16;
  const size = compact ? 24 : 28;

  const bulbAnimRefs = useRef<Animated.Value[]>(
    Array.from({ length: SPOKES }, () => new Animated.Value(0)),
  );

  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bulbLoops: Animated.CompositeAnimation[] = [];

    bulbAnimRefs.current.forEach((v, idx) => {
      const delay = idx % 2 === 0 ? 0 : 500;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 500,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      bulbLoops.push(loop);
      loop.start();
    });

    const shake = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -1, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: -1, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -1, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.timing(shakeY, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.delay(2000),
      ]),
    );
    shake.start();

    return () => {
      bulbLoops.forEach((a) => a.stop());
      shake.stop();
    };
  }, [shakeX, shakeY]);

  const spokes = useMemo(() => Array.from({ length: SPOKES }, (_, i) => i), []);

  return (
    <View style={[styles.root, { width: size, height: size }]} pointerEvents="none">
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {spokes.map((i) => {
          const angle = i * 45;
          const v = bulbAnimRefs.current[i];
          const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });
          const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
          return (
            <View
              key={i}
              style={[
                styles.spoke,
                {
                  left: size / 2,
                  top: size / 2,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.bulb,
                  {
                    width: bulb,
                    height: bulb,
                    marginLeft: -bulb / 2,
                    top: -ringR,
                    opacity,
                    transform: [{ scale }],
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.starWrap,
          {
            width: star,
            height: star,
            marginLeft: -star / 2,
            marginTop: -star / 2,
            transform: [{ translateX: shakeX }, { translateY: shakeY }],
          },
        ]}
        pointerEvents="none"
      >
        <StarCoinSvg width={star} height={star} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    position: "relative",
    flexShrink: 0,
  },
  spoke: {
    position: "absolute",
    width: 0,
    height: 0,
  },
  bulb: {
    position: "absolute",
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 999,
  },
  starWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
  },
});

