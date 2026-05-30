import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';

const JoinUs = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const cfg_site_base: any = useSelector((state: RootState) => state?.user?.cfg_site_base);
  const indexFooter: any = useSelector((state: RootState) => state?.selfConfig?.indexFooter);


  const handleShare = async (type: string) => {
    let url = '';
    switch (type) {
      case 'Facebook':
        url = cfg_site_base.facebookUrl
        break;
      case 'Telegram':
        url = cfg_site_base.telegram
        break;
      case 'WhatsApp':
        url = cfg_site_base.whatsapp
        break;
      case 'Instagram':
        url = cfg_site_base.instgramHomePageUrl
        break;
      case 'Twitter':
        url = cfg_site_base.twitter
        break;
      case 'Youtobe':
        url = cfg_site_base.youtobeUrl
        break;
      default:
        break;
    }
    try {
      const supported = await Linking.canOpenURL(url)
      supported && Linking.openURL(url)
    } catch { }
  };

  return (
    <View style={styles.container}>
      {indexFooter == 1 && <>
        <View className='justify-left items-center flex-row' style={{ height: 30, marginTop: 10, }}>
          <View className='rounded-md w-2 h-2 mr-1' style={{ backgroundColor: Colors[theme].primary }}></View>
          <Text className='font-medium' style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.joinUs")}</Text>
        </View>
        <View style={[styles.socialContainer, { backgroundColor: Colors[theme].cardBg1, paddingVertical: 12 }]}>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Facebook')}>
            <Image
              source={require('@/assets/images/home/footImg2.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Telegram')}>
            <Image
              source={require('@/assets/images/home/footImg1.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('WhatsApp')}>
            <Image
              source={require('@/assets/images/home/footImg3.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Instagram')}>
            <Image
              source={require('@/assets/images/home/footImg4.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Twitter')}>
            <Image
              source={require('@/assets/images/home/footImg7.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Youtobe')}>
            <Image
              source={require('@/assets/images/home/footImg5.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </>}
      {indexFooter == 2 && <>
        <View className='justify-left items-center flex-row' >
          <Text className='font-medium' style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.bottomArea.socialNetworks")}</Text>
        </View>
        <View style={[styles.socialContainer, { paddingVertical: 0, marginTop: 12 }]}>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Facebook')}>
            <Image
              source={require('@/assets/images/home/footImg2.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Telegram')}>
            <Image
              source={require('@/assets/images/home/footImg1.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('WhatsApp')}>
            <Image
              source={require('@/assets/images/home/footImg3.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Instagram')}>
            <Image
              source={require('@/assets/images/home/footImg4.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Twitter')}>
            <Image
              source={require('@/assets/images/home/footImg7.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Youtobe')}>
            <Image
              source={require('@/assets/images/home/footImg5.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </>}
      {indexFooter == 3 && <>
        <View style={[styles.socialContainer, { backgroundColor: Colors[theme].cardBg1, paddingVertical: 12 }]}>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Facebook')}>
            <Image
              source={require('@/assets/images/home/footImg2.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Telegram')}>
            <Image
              source={require('@/assets/images/home/footImg1.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('WhatsApp')}>
            <Image
              source={require('@/assets/images/home/footImg3.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Instagram')}>
            <Image
              source={require('@/assets/images/home/footImg4.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Twitter')}>
            <Image
              source={require('@/assets/images/home/footImg7.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity className='flex-1' onPress={() => handleShare('Youtobe')}>
            <Image
              source={require('@/assets/images/home/footImg5.png')}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </>}
      {indexFooter == 4 && <>
        <View className='mt-4' style={{ backgroundColor: Colors[theme].cardBg1, borderRadius: 8 }}>
          <View className='justify-left items-center flex-row ml-7' style={{ height: 30, marginTop: 10, }}>
            <View className='rounded-md w-2 h-2 mr-1' style={{ backgroundColor: Colors[theme].primary }}></View>
            <Text className='font-medium' style={{ color: Colors[theme].text, fontSize: 13 }}>{t("home.joinUs")}</Text>
          </View>
          <View style={[styles.socialContainer, { paddingVertical: 12 }]}>
            <TouchableOpacity className='flex-1' onPress={() => handleShare('Facebook')}>
              <Image
                source={require('@/assets/images/home/footImg2.png')}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity className='flex-1' onPress={() => handleShare('Telegram')}>
              <Image
                source={require('@/assets/images/home/footImg1.png')}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity className='flex-1' onPress={() => handleShare('WhatsApp')}>
              <Image
                source={require('@/assets/images/home/footImg3.png')}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity className='flex-1' onPress={() => handleShare('Instagram')}>
              <Image
                source={require('@/assets/images/home/footImg4.png')}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity className='flex-1' onPress={() => handleShare('Twitter')}>
              <Image
                source={require('@/assets/images/home/footImg7.png')}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity className='flex-1' onPress={() => handleShare('Youtobe')}>
              <Image
                source={require('@/assets/images/home/footImg5.png')}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

      </>}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,

  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  socialContainer: {
    borderRadius: 8,
    paddingHorizontal: 10,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  socialIcon: {
    width: 33,
    height: 33,
  },
  bottomArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  }
});

export default JoinUs;