import { useToast } from "@/components/common/toast";
import { I18nText } from "@/components/I18nText";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { FC, ReactNode, useCallback } from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from "react-i18next";

interface ContentCardProps {
  children: ReactNode;
  className?: string;
}
interface UsernameProps {
  username: string;
  children?: ReactNode;
}
interface ContentCardItemProps {
  labelKey: string;
  value: string | number;
  valueColor?: string;
  valueStyle?: TextStyle;
}

const ContentCard: FC<ContentCardProps> = ({ className, children }) => {
  const { theme } = useTheme();
  return (
    <View className={`bg-${theme}-btnText p-2.5 rounded-lg mb-3 ` + className}>
      {children}
    </View>
  );
};
export const Username: FC<UsernameProps> = ({ username, children }) => {
  const toast = useToast();
  const {
    theme,
    themeColors: { text },
  } = useTheme();
  const { t } = useTranslation();
  const onCopy = useCallback(() => {
    Clipboard.setString(username);
    toast.success(t("common.copySuccess"));
  }, [username, toast]);

  return (
    <View className={`flex-row flex-1 items-center gap-2 mb-1`}>
      <I18nText
        i18nKey="betRecord.username"
        className={`flex-1 text-${theme}-text`}
      />
      <Text className={`text-${theme}-text text-xs font-bold`}>{username}</Text>
      {children}
      <TouchableOpacity onPress={onCopy}>
        <Ionicons color={text} name="copy-outline" size={15} />
      </TouchableOpacity>
    </View>
  );
};
export const ContentCardItem: FC<ContentCardItemProps> = ({
  labelKey,
  value,
  valueColor,
  valueStyle,
}) => {
  const {
    theme,
    themeColors: { text },
  } = useTheme();
  return (
    <View className="flex-row justify-between items-center py-1.5">
      <I18nText
        i18nKey={labelKey}
        className={`text-xs text-${theme}-textGray`}
      />
      <Text
        className="text-xs font-bold"
        style={[
          valueStyle,
          {
            color: valueColor ?? text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

export default ContentCard;
