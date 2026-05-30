import { ReactNode } from "react";
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from "@/hooks/theme/ThemeProvider";
import { HideScreenHeader } from "@/components/common/Header";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useBottomNavigation } from "@/hooks/useBottomNavigation";

interface PageWrapProps {
  titleKey: string
  children: ReactNode
}

export default function PageWrap({ titleKey, children }: PageWrapProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isShow } = useBottomNavigation();

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'bottom']} className={`flex-1 bg-${theme}-background`}>
        <HideScreenHeader title={t(titleKey)} />
        <View className={`flex-1 p-3 ${isShow && 'pb-16'}`}>
          {children}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
