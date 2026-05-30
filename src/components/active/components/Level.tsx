//Leve等级图标
import { View, StyleSheet, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getVipConfig } from '@/components/active/components/activeConfg';

interface LevelProps {
  level?: number;
}

export const Level: React.FC<LevelProps> = ({ level }) => {
  if (level == null) return;
  const card = getVipConfig(level).card;
  const badgeSource = card.badge;
  if (!card || !badgeSource) return;

  return (
    <View className="flex-row items-center overflow-hidden">
      <View style={styles.iconWrap}>
        <Image source={badgeSource} resizeMode="contain" style={styles.icon} />
      </View>
      <LinearGradient
        style={styles.textWrap}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[card.progress!, card.color!.e]}>
        <Text style={styles.text}>
          {`VIP${level}`}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  icon: {
    width: 38,
    height: 38,
  },
  textWrap: {
    marginLeft: -9,
    marginBottom: -9,
    transform: [{ skewX: '-10deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  text: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 8,
    lineHeight: 8,
    zIndex: 3,
  },
});