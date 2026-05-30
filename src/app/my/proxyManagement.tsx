/**代理管理 */
import BaseTab from "@/components/common/BaseTab";
import { SimpleHeader } from "@/components/common/Header";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyShare from "../../components/my/MyShare";
import TeamOverview from "../../components/my/TeamOverview";
import UserList from "../../components/my/UserList";
import { Colors } from "@/constants/Colors";
import { rf } from "@/utils/scaleFont";

const ProxyManagement = () => {
  const [baseIndex, setBaseIndex] = useState(0);
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, overflow: "hidden" }}
      className={`bg-${theme}-btnText`}
    >
      <SimpleHeader title={t("agent.proxyManagement")} />
      <View className={`w-full px-4 shadow bg-${theme}-cardBg1`}>
        <BaseTab
          selectedIndex={baseIndex}
          setIndex={setBaseIndex}
          tabs={[
            { name: t("agent.myShare") },
            { name: t("agent.teamOverview") },
            { name: t("agent.userList") },
          ]}
          TextStyle={{
            color: "#adb7ba",
            textAlign: "center",
            fontSize: rf(13),
          }}
          ActiveTextStyle={{
            color: Colors[theme].darkColor,
            fontWeight: 500,
            fontSize: rf(13),
            textAlign: "center",
          }}
          showIndicator={false}
          scrollStyle={{ alignItems: "center" }}
          tabStyle={{ height: 40 }}
        />
      </View>
      <View style={{ flex: 1, width: "100%", minHeight: 0 }}>
        {baseIndex === 0 && <MyShare />}
        {baseIndex === 1 && <TeamOverview />}
        {baseIndex === 2 && <UserList />}
      </View>
    </SafeAreaView>
  );
};

export default ProxyManagement;
