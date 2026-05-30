import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
//import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/theme/ThemeProvider";
import Ionicons from '@expo/vector-icons/Ionicons';
import Modal from "react-native-modal";
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useToast } from '../../common/toast';
import { useMaxWidth } from '@/hooks/useMaxWidth';
const isWeb = Platform.OS === "web";
interface MenuItemProps {
  title: string;
  img?: any,
  onPress: () => void;
}

interface SubMenuItem {
  title: string;
  route: string;
  routeParams?: {
    type: string
  }
}

interface MenuItem {
  title: string;
  subItems: SubMenuItem[];
  img: any;
}



const MenuItem: React.FC<MenuItemProps> = ({ title, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={[styles.menuItem, { flexDirection: 'row' }]} onPress={onPress}>
      <Text style={[styles.menuText, { color: Colors[theme].text }]}>{title}</Text>
      <View className='w-7 h-7  rounded-md flex justify-center items-center'
        style={{
          backgroundColor: Colors[theme].blockBg,
        }}
      >
        <Ionicons name="chevron-forward" size={14} color={Colors[theme].lightText} />
      </View>
    </TouchableOpacity>
  );
};

const MenuItem3: React.FC<MenuItemProps> = ({ title, img, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity className='flex-1 justify-center items-center flex-col pt-4 pb-4' style={styles.menuItem} onPress={onPress}>
      {<Image
        source={img}
        style={{ width: 40, height: 40 }}
        resizeMode="contain"
      />}
      <Text style={[styles.menuText, { color: Colors[theme].text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const MenuItem4: React.FC<MenuItemProps> = ({ title, img, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity className='flex-1 justify-center items-center flex-col pt-4 pb-4' style={[styles.menuItem,]} onPress={onPress}>
      <View className='justify-center items-center' style={{ height: 40, width: 40, borderRadius: 33, backgroundColor: Colors[theme].primary }}>
        <Image
          source={img}
          style={{ width: 33, height: 33, }}
          resizeMode="contain"
        />
      </View>
      <Text className='mt-2' style={[styles.menuText, { color: Colors[theme].text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const AboutUs = () => {
  const { maxWidth } = useMaxWidth();
  const { theme } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const userInfo: any = useSelector((state: RootState) => state?.user?.userInfo);
  const indexFooter: any = useSelector((state: RootState) => state?.selfConfig?.indexFooter);
  const toast = useToast();
  const handlePress = (menu: MenuItem) => {

    if (indexFooter == 4 && menu.title == 'VIP') {
      if (!userInfo.isLogin) {
        navigation.push("login");
        return
      } else {
        if (userInfo?.type == 150) {
          toast.warn(t("tryAccount.trialAccountWarning"));
          return;
        } else {
          navigation.navigate('active/vipPage')
          return
        }
      }
    } else {
      setSelectedMenu(menu);
      setModalVisible(true);
    }

  };

  const handleSubItemPress = (item: SubMenuItem) => {
    const { route, routeParams } = item
    if (route == 'promotion' || route == '/promotion') {
      if (!userInfo.isLogin) {
        navigation.push("login");
        setModalVisible(false);
        return
      } else {
        if (userInfo?.type == 150) {
          toast.warn(t("tryAccount.trialAccountWarning"));
          return;
        }
      }
    }
    if (route == 'active/vipPage') {
      if (!userInfo.isLogin) {
        navigation.push("login");
        setModalVisible(false);
        return
      }
    }
    if (routeParams) {
      navigation.navigate(route, routeParams)
    } else {
      navigation.navigate(route)
    }
    setModalVisible(false);
  };



  const menuData: MenuItem[] = [
    {
      title: t("pageName.activity"),
      subItems: [
        { title: "VIP", route: 'active/vipPage' },
        { title: t("home.activityCenter"), route: 'active' },
        { title: t("home.promoteInfo"), route: 'promotion' },
      ],
      img: require("@/assets/images/home/footer/activity.png"),
    },
    {
      title: t("home.aboutUs"),
      subItems: [
        { title: t("pageName.about"), route: 'my/aboutDataManagement', routeParams: { type: '1' } },
      ],
      img: require("@/assets/images/home/footer/about-us.png"),
    },
    {
      title: t("home.helpCenter"),
      subItems: [
        { title: t("pageName.depositAssistance"), route: 'my/aboutDataManagement', routeParams: { type: '3' } },
        { title: t("pageName.withdrawalAssistance"), route: 'my/aboutDataManagement', routeParams: { type: '2' } },
      ],
      img: require("@/assets/images/home/footer/help-center.png"),
    },
    {
      title: t("pageName.contactUs"),
      subItems: [
        { title: t("pageName.contactUs"), route: "my/aboutDataManagement", routeParams: { type: '6' } },
      ],
      img: require("@/assets/images/home/footer/contact-us.png"),
    }
  ];

  const menuData4: MenuItem[] = [
    {
      title: "VIP",
      subItems: [],
      img: require("@/assets/images/home/footer/vip.webp"),
    },
    {
      title: t("home.aboutUs"),
      subItems: [
        { title: t("common.about"), route: 'my/aboutDataManagement', routeParams: { type: '1' } },
      ],
      img: require("@/assets/images/home/footer/about-us.png"),
    },
    {
      title: t("home.helpCenter"),
      subItems: [
        { title: t("pageName.depositAssistance"), route: 'my/aboutDataManagement', routeParams: { type: '3' } },
        { title: t("pageName.withdrawalAssistance"), route: 'my/aboutDataManagement', routeParams: { type: '2' } },
      ],
      img: require("@/assets/images/home/footer/help-center2.png"),
    },
    {
      title: t("pageName.contactUs"),
      subItems: [
        { title: t("pageName.contactUs"), route: "my/aboutDataManagement", routeParams: { type: '6' } },
      ],
      img: require("@/assets/images/home/footer/contact-us2.png"),
    }
  ];

  return (
    <View style={styles.container}>
      {indexFooter == 1 && <View style={[styles.menuContainer, { backgroundColor: Colors[theme].cardBg1 }]}>
        {menuData.map((menu, index) => (
          <MenuItem
            key={index}
            img={""}
            title={menu.title}
            onPress={() => handlePress(menu)}
          />
        ))}
      </View>}

      {indexFooter == 3 && <View className='flex-row justify-between' style={[styles.menuContainer, { backgroundColor: Colors[theme].cardBg1 }]}>
        {menuData.map((menu, index) => (
          <MenuItem3
            key={index}
            title={menu.title}
            img={menu.img}
            onPress={() => handlePress(menu)}
          />
        ))}
      </View>}
      {indexFooter == 4 && <View className='flex-row justify-between' style={[styles.menuContainer, { backgroundColor: Colors[theme].cardBg1 }]}>
        {menuData4.map((menu, index) => (
          <MenuItem4
            key={index}
            title={menu.title}
            img={menu.img}
            onPress={() => handlePress(menu)}
          />
        ))}
      </View>}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={[styles.modalContent, { backgroundColor: Colors[theme].background, width: maxWidth }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>{selectedMenu?.title}</Text>
          </View>
          <View style={styles.modalBody}>
            {selectedMenu?.subItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.subMenuItem}
                onPress={() => handleSubItemPress(item)}
              >
                <Text style={[styles.subMenuText, { color: Colors[theme].lightText }]}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: 20,
  },
  menuContainer: {
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  menuItem: {
    //flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 13,
    textAlign: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    paddingHorizontal: 15,
  },
  subMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  subMenuText: {
    fontSize: 12,
    color: '#333',
  },
});

export default AboutUs;