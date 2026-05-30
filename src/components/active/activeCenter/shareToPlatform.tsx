import { Platform, Share, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';

export type PlatformType = 'facebook' | 'whatsapp' | 'telegram' | 'instagram' | 'twitter';

const getShareUrl = (platform: PlatformType, message: string, url: string) => {

  const encodedMsg = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(url);

  const shareUrls: Record<PlatformType, string> = {
    telegram: `tg://msg?text=${encodedMsg}%20${encodedUrl}`,
    whatsapp: `whatsapp://send?text=${encodedMsg}%20${encodedUrl}`,
    facebook: `fb://facewebmodal/f?href=https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: `instagram://camera`,
    twitter: `twitter://post?message=${encodedMsg}%20${encodedUrl}`,
  };

  return shareUrls[platform];
};

export const shareToPlatform = async (
  platform: PlatformType,
  message: string,
  url: string
) => {

  if (Platform.OS === 'web') {
    const webLinks: Record<PlatformType, string> = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}%20${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
    };

    // if (navigator.share) {
    //   try {
    //     await navigator.share({ title: message, text: message, url });
    //     return;
    //   } catch {
    window.open(webLinks[platform], '_blank');
    //   }
    // } else {
    //   window.open(webLinks[platform], '_blank');
    // }
  } else {
    const shareUrl = getShareUrl(platform, message, url);
    const fallbackShare = async () => {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(url, { dialogTitle: message });
      } else {
        await Share.share({ message: `${message} ${url}` });
      }
    };

    try {
      const canOpen = await Linking.canOpenURL(shareUrl);
      if (canOpen) {
        await Linking.openURL(shareUrl);
      } else {
        await fallbackShare();
      }
    } catch {
      await fallbackShare();
    }
  }
};
