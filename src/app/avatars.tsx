import { HideScreenHeader } from "@/components/common/Header";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { avatarImages, AvatarKey, AVATAR_STORAGE_KEY, AVATAR_SIZE } from '@/constants/avatars';

export default function AvatarsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const params = useLocalSearchParams();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>(
    (params.index?.toString() || '1') as AvatarKey
  );

  const avatars = Object.keys(avatarImages) as AvatarKey[];
  const { theme } = useTheme();
  const handleSelectAvatar = async (avatar: AvatarKey) => {
    setSelectedAvatar(avatar);
    await AsyncStorage.setItem(AVATAR_STORAGE_KEY, avatar);
    navigation.goBack();
  };
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", overflow: "hidden" }}>
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <HideScreenHeader title={t('my.changePicture')} />
        <ScrollView
          style={styles.content}
          className="hide-scrollbar"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.avatarGrid}>
            {avatars.map((avatar) => (
              <TouchableOpacity
                key={avatar}
                style={styles.avatarItem}
                onPress={() => handleSelectAvatar(avatar)}
              >
                <View style={[
                  styles.avatarBox,
                  selectedAvatar === avatar && styles.selectedAvatarBox
                ]}>
                  <Image
                    source={avatarImages[avatar]}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  {selectedAvatar === avatar && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 32,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 5,
  },
  avatarItem: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginBottom: 15,
  },
  avatarBox: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  selectedAvatarBox: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
}); 