

// 活动页主题配图
export const activeTheme: any = {
  greenBlack: {
    banner: { s: 'rgba(64, 101, 74, 1)', e: 'rgba(0, 255, 0, 0)' },
    box: { s: 'rgba(64, 101, 74, 1)', e: 'rgba(41, 44, 43, 1)' },
    image: require('@/assets/images/active/black.png'),
  },
  blueWhite: {
    banner: { s: 'rgba(204, 220, 255, 1)', e: 'rgba(255, 255, 255, 0)' },
    box: { s: 'rgba(204, 220, 255, 1)', e: 'rgba(255, 255, 255, 1)' },
    image: require('@/assets/images/active/blue.png'),
  },
  orangeWhite: {
    banner: { s: 'rgba(244, 141, 22, 0.56)', e: 'rgba(255, 255, 255, 0)' },
    box: { s: 'rgba(244, 141, 22, 0.56)', e: 'rgba(255, 255, 255, 1)' },
    image: require('@/assets/images/active/orange.png'),
  },
};

// 活动中心配图
export const activeCenterConfig = {
  promotion: {
    state(state: string) {
      const boxImg: Record<string, any> = {
        'box_0': require('@/assets/images/active/baoxiang1.png'), // 不可开
        'box_1': require('@/assets/images/active/baoxiang2.png'), // 待开
        'box_2': require('@/assets/images/active/baoxiang3.png'), // 已开
        'hongbao_0': require('@/assets/images/active/hongbao1.png'), // 已开
        'hongbao_1': require('@/assets/images/active/hongbao2.png'), // 已开
        'hongbao_2': require('@/assets/images/active/hongbao3.png'), // 已开
      };
      return boxImg[state];
    }
  }
};

// 任务中心主题配图
export const missionTheme: any = {
  greenBlack: {
    renwu: require('@/assets/images/active/missionCenter/renwu-green.png'),
    xiala: require('@/assets/images/active/missionCenter/xiala-green.png'),
    nodata: require('@/assets/images/active/missionCenter/nodata-green.png'),
    content: { a: 'rgba(41, 44, 43, 1)', b: "#373939" },
    checkBox: { s: 'rgba(255,255,255,0.1)', e: 'rgba(83, 146, 99, 1)', m: 'rgba(74, 128, 89, 1)' },
    download: {
      bg: require('@/assets/images/active/missionCenter/download-green.png'),
      a: require('@/assets/images/active/missionCenter/android-dark.png'),
      i: require('@/assets/images/active/missionCenter/apple-dark.png'),
    },
    cardActiveHead: { s: '#75eb9250', e: '#292c2b' },
    activeProviderBg: { s: 'rgba(117, 235, 146, 0)', e: 'rgba(117, 235, 146, 0.4)'}
  },
  blueWhite: {
    renwu: require('@/assets/images/active/missionCenter/renwu-blue.png'),
    xiala: require('@/assets/images/active/missionCenter/xiala-blue.png'),
    nodata: require('@/assets/images/active/missionCenter/nodata-blue.png'),
    content: { a: '#fff', b: "#f5f5f5" },
    checkBox: { s: 'rgba(255,255,255,1)', e: 'rgba(218, 240, 255, 1)', m: 'rgba(174, 222, 255, 1)' },
    download: {
      bg: require('@/assets/images/active/missionCenter/download-blue.png'),
      a: require('@/assets/images/active/missionCenter/android-write.png'),
      i: require('@/assets/images/active/missionCenter/apple-write.png'),
    },
    cardActiveHead: { s: '#4781ff50', e: '#ffffff' },
    activeProviderBg: { s: 'rgba(71, 129, 255, 0)', e: 'rgba(71, 129, 255, 0.4)'}
  },
  orangeWhite: {
    renwu: require('@/assets/images/active/missionCenter/renwu-orange.png'),
    xiala: require('@/assets/images/active/missionCenter/xiala-orange.png'),
    nodata: require('@/assets/images/active/missionCenter/nodata-orange.png'),
    content: { a: '#fff', b: "#f5f5f5" },
    checkBox: { s: 'rgba(255,255,255,1)', e: 'rgba(253, 232, 208, 1)', m: 'rgba(253, 232, 208, 1)' },
    download: {
      bg: require('@/assets/images/active/missionCenter/download-orange.png'),
      a: require('@/assets/images/active/missionCenter/android-write.png'),
      i: require('@/assets/images/active/missionCenter/apple-write.png'),
    },
    cardActiveHead: { s: '#f48d1650', e: '#ffffff' },
    activeProviderBg: { s: 'rgba(244, 141, 22, 0)', e: 'rgba(244, 141, 22, 0.4)'}
  },
};

// 返水
export const rebateTheme:any = {
  greenBlack: {
    text: { a: 'rgba(173, 183, 186, 1)', b: 'rgba(173, 183, 186, 1)' },
    content:'#1c1c1e'
  },
  blueWhite: {
    text: { a: '#202222', b: '#292c2b' },
    content:'#ffffff'
  },
  orangeWhite: {
    text: { a: '#202222', b: '#292c2b' },
    content:'#ffffff'
  },
};

//待办主题配图
export const beDealtTheme: any = {
  greenBlack: {
    boxa: { s: 'rgba(117, 235, 146, 0.04)', e: 'rgba(169, 231, 130, 0.1)' },
    btn: { s: 'rgba(117, 235, 146, 1)', e: 'rgba(169, 231, 130, 1)' },
    line: 'rgba(53, 57, 58, 1)',
  },
  blueWhite: {
    boxa: { s: 'rgba(71, 129, 255, 0.04)', e: 'rgba(71, 181, 255, 0.1)' },
    btn: { s: 'rgba(71, 129, 255, 1)', e: 'rgba(71, 181, 255, 1)' },
    line: 'rgba(240, 240, 240, 1)',
  },
  orangeWhite: {
    boxa: { s: 'rgba(244, 141, 22, 0.04)', e: 'rgba(255, 217, 0, 0.1)' },
    btn: { s: 'rgba(244, 141, 22, 1)', e: 'rgba(255, 217, 0, 1)' },
    line: 'rgba(240, 240, 240, 1)',
  },
};

// 神秘奖金主题配图
export const specialBonusTheme: any = {
  greenBlack: {
    bottomBg: { s: 'rgba(71, 129, 255, 0.00)', e: 'rgba(71, 181, 255, 0.10)' },
    cardBga: 'rgba(71, 129, 255, 0.10)',
  },
  blueWhite: {
    bottomBg: { s: 'rgba(71, 129, 255, 0.00)', e: 'rgba(71, 181, 255, 0.10)' },
    cardBga: 'rgba(71, 129, 255, 0.10)',
  },
  orangeWhite: {
    bottomBg: { s: 'rgba(71, 129, 255, 0.00)', e: 'rgba(71, 181, 255, 0.10)' },
    cardBga: 'rgba(71, 129, 255, 0.10)',
  },
};

//vip主题配图
export const vipTheme: any = {
  greenBlack: {
    title: require('@/assets/images/active/vip/title-green.png'),
    crown: require('@/assets/images/active/vip/crown-green.png'),
    wallet: require('@/assets/images/active/vip/wallet-green.png'),
    context: require('@/assets/images/active/vip/context-green.png'),
    box: { s: 'rgba(117, 235, 146, 1)', e: 'rgba(169, 231, 130, 1)' },
    boxa: { s: 'rgba(117, 235, 146, 0.04)', e: 'rgba(169, 231, 130, 0.1)' },
    cardBga: 'rgba(41, 44, 43, 0.9)',
    boxborder: 'rgba(169, 231, 130, 0.1)',
    columnProgress: 'rgba(32, 34, 34, 1)',
    baseLayerBg: {s: '#2a2c2c', e: '#313f35'},
    lineLabelBg: 'rgba(117, 235, 146, 0.1)'
  },
  blueWhite: {
    title: require('@/assets/images/active/vip/title-blue.png'),
    crown: require('@/assets/images/active/vip/crown-blue.png'),
    wallet: require('@/assets/images/active/vip/wallet-blue.png'),
    context: require('@/assets/images/active/vip/context-blue.png'),
    box: { s: 'rgba(71, 129, 255, 1)', e: 'rgba(71, 181, 255, 1)' },
    boxa: { s: 'rgba(71, 129, 255, 0.04)', e: 'rgba(71, 181, 255, 0.1)' },
    cardBga: 'rgba(255, 255, 255, 0.9)',
    boxborder: 'rgba(71, 181, 255, 0.1)',
    columnProgress: 'rgba(235, 236, 243, 1)',
    baseLayerBg: {s: '#ffffff', e: '#edf3ff'},
    lineLabelBg: 'rgba(71, 129, 255, 0.1)'
  },
  orangeWhite: {
    title: require('@/assets/images/active/vip/title-orange.png'),
    crown: require('@/assets/images/active/vip/crown-orange.png'),
    wallet: require('@/assets/images/active/vip/wallet-orange.png'),
    context: require('@/assets/images/active/vip/context-orange.png'),
    box: { s: 'rgba(244, 141, 22, 1)', e: 'rgba(255, 217, 0, 1)' },
    boxa: { s: 'rgba(244, 141, 22, 0.04)', e: 'rgba(255, 217, 0, 0.1)' },
    cardBga: 'rgba(255, 255, 255, 0.9)',
    boxborder: 'rgba(255, 217, 0, 0.1)',
    columnProgress: 'rgba(235, 236, 243, 1)',
    baseLayerBg: {s: '#ffffff', e: '#fffbe7'},
    lineLabelBg: 'rgba(244, 141, 22, 0.1)'
  },
};

// vip各主题头部背景
export const bg: any = {
  greenBlack: {
    1: require('@/assets/images/active/vip/bg_green1.png'),
    2: require('@/assets/images/active/vip/bg_green2.png'),
  },
  blueWhite: {
    1: require('@/assets/images/active/vip/bg_blue1.png'),
    2: require('@/assets/images/active/vip/bg_blue2.png'),
  },
  orangeWhite: {
    1: require('@/assets/images/active/vip/bg_orange1.png'),
    2: require('@/assets/images/active/vip/bg_orange2.png'),
  },
}

//此逻辑与vipConf相对应，随意删减可能报错
export const getVipConfig = (levelNum: number) => {
  const cardLevel = Math.min(levelNum, 32);
  return {
    card: vipConf[cardLevel]
  };
};
//vip各等级的小卡片
export const vipConf: {
  [key: string]: {
    icon: any;
    badge: any;
    color: { s: string; e: string };
    progress: string,
    pro: { s: string; e: string };
    shadow: { s: string; e: string };
  };
} = {
  '0': {
    icon: require('@/assets/images/active/vip/vip0.png'),
    badge: require('@/assets/images/active/vip/badge0.png'),
    color: { s: 'rgba(255, 205, 163, 1)', e: 'rgba(255, 153, 102, 1)' },
    progress: 'rgba(241, 121, 72, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(242, 139, 88, 1)' },
    shadow: { s: 'rgba(253, 223, 189, 1)', e: 'rgba(207, 104, 65, 1)' }
  },
  '1': {
    icon: require('@/assets/images/active/vip/vip1.png'),
    badge: require('@/assets/images/active/vip/badge1.png'),
    color: { s: 'rgba(191, 200, 214, 1)', e: 'rgba(136, 158, 190, 1)' },
    progress: 'rgba(116, 138, 170, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(164, 181, 205, 1)' },
    shadow: { s: 'rgba(177, 196, 225, 1)', e: 'rgba(96, 117, 150, 1)' }
  },
  '2': {
    icon: require('@/assets/images/active/vip/vip2.png'),
    badge: require('@/assets/images/active/vip/badge2.png'),
    color: { s: 'rgba(249, 206, 156, 1)', e: 'rgba(240, 145, 50, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(244, 191, 67, 1)' },
    shadow: { s: 'rgba(255, 195, 135, 1)', e: 'rgba(173, 89, 19, 1)' }
  },
  '3': {
    icon: require('@/assets/images/active/vip/vip3.png'),
    badge: require('@/assets/images/active/vip/badge3.png'),
    color: { s: 'rgba(255, 164, 147, 1)', e: 'rgba(255, 120, 120, 1)' },
    progress: 'rgba(244, 76, 76, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(255, 142, 148, 1)' },
    shadow: { s: 'rgba(255, 173, 160, 1)', e: 'rgba(215, 50, 56, 1)' }
  },
  '4': {
    icon: require('@/assets/images/active/vip/vip4.png'),
    badge: require('@/assets/images/active/vip/badge4.png'),
    color: { s: 'rgba(255, 211, 125, 1)', e: 'rgba(255, 140, 33, 1)' },
    progress: 'rgba(226, 108, 20, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(255, 158, 57, 1)' },
    shadow: { s: 'rgba(255, 213, 150, 1)', e: 'rgba(196, 73, 0, 1)' }
  },
  '5': {
    icon: require('@/assets/images/active/vip/vip5.png'),
    badge: require('@/assets/images/active/vip/badge5.png'),
    color: { s: 'rgba(255, 216, 96, 1)', e: 'rgba(255, 195, 4, 1)' },
    progress: 'rgba(255, 150, 27, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(255, 239, 92, 1)' },
    shadow: { s: 'rgba(255, 249, 169, 1)', e: 'rgba(219, 125, 15, 1)' }
  },
  '6': {
    icon: require('@/assets/images/active/vip/vip6.png'),
    badge: require('@/assets/images/active/vip/badge6.png'),
    color: { s: 'rgba(135, 222, 102, 1)', e: 'rgba(73, 175, 34, 1)' },
    progress: 'rgba(12, 152, 51, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(160, 231, 130, 1)' },
    shadow: { s: 'rgba(189, 255, 175, 1)', e: 'rgba(0, 117, 52, 1)' }
  },
  '7': {
    icon: require('@/assets/images/active/vip/vip7.png'),
    badge: require('@/assets/images/active/vip/badge7.png'),
    color: { s: 'rgba(102, 222, 186, 1)', e: 'rgba(22, 187, 197, 1)' },
    progress: 'rgba(12, 152, 152, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(122, 255, 218, 1)' },
    shadow: { s: 'rgba(175, 255, 231, 1)', e: 'rgba(0, 117, 110, 1)' }
  },
  '8': {
    icon: require('@/assets/images/active/vip/vip8.png'),
    badge: require('@/assets/images/active/vip/badge8.png'),
    color: { s: 'rgba(120, 207, 235, 1)', e: 'rgba(0, 178, 255, 1)' },
    progress: 'rgba(0, 146, 255, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(103, 209, 255, 1)' },
    shadow: { s: 'rgba(176, 240, 255, 1)', e: 'rgba(18, 114, 254, 1)' }
  },
  '9': {
    icon: require('@/assets/images/active/vip/vip9.png'),
    badge: require('@/assets/images/active/vip/badge9.png'),
    color: { s: 'rgba(85, 186, 241, 1)', e: 'rgba(61, 118, 232, 1)' },
    progress: 'rgba(20, 81, 239, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(132, 159, 255, 1)' },
    shadow: { s: 'rgba(209, 224, 255, 1)', e: 'rgba(10, 62, 167, 1)' }
  },
  '10': {
    icon: require('@/assets/images/active/vip/vip10.png'),
    badge: require('@/assets/images/active/vip/badge10.png'),
    color: { s: 'rgba(208, 133, 226, 1)', e: 'rgba(141, 72, 254, 1)' },
    progress: 'rgba(114, 49, 255, 1)',
    pro: { s: 'rgba(255, 255, 255, 1)', e: 'rgba(186, 141, 255, 1)' },
    shadow: { s: 'rgba(238, 178, 244, 1)', e: 'rgba(87, 10, 217, 1)' }
  },
  '11': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge11.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 228, 223, 1)', e: 'rgba(255, 51, 60, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '12': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge12.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 230, 191, 1)', e: 'rgba(255, 138, 0, 1)  ' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '13': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge13.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(233, 255, 226, 1)', e: 'rgba(78, 198, 64, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '14': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge14.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(215, 255, 246, 1)', e: 'rgba(3, 192, 169, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '15': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge15.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(229, 250, 255, 1)', e: 'rgba(0, 164, 234, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '16': {
    icon: require('@/assets/images/active/vip/vip16.png'),
    badge: require('@/assets/images/active/vip/badge16.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(207, 226, 255, 1)', e: 'rgba(38, 100, 221, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '17': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge17.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(233, 211, 255, 1)', e: 'rgba(74, 45, 255, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '18': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge18.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 222, 239, 1)', e: 'rgba(175, 45, 255, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '19': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge19.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 132, 15, 1)', e: 'rgba(255, 46, 57, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '20': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge20.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 244, 86, 1)', e: 'rgba(118, 220, 86, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '21': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge21.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(206, 254, 243, 1)', e: 'rgba(121, 199, 255, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '22': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge22.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(121, 199, 255, 1)', e: 'rgba(8, 117, 246, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '23': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge23.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(252, 126, 255, 1)', e: 'rgba(85, 36, 219, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '24': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '25': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '26': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '27': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '28': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '29': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '30': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '31': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
  '32': {
    icon: require('@/assets/images/active/vip/vip11.png'),
    badge: require('@/assets/images/active/vip/badge24.png'),
    color: { s: 'rgba(254, 250, 232, 1)', e: 'rgba(246, 196, 119, 1)' },
    progress: 'rgba(214, 125, 38, 1)',
    pro: { s: 'rgba(255, 253, 245, 1)', e: 'rgba(255, 191, 91, 1)' },
    shadow: { s: 'rgba(255, 246, 209, 1)', e: 'rgba(164, 94, 0, 1)' }
  },
};

//vip弹窗
export const proPopup: any = {
  greenBlack: {
    header: require('@/assets/images/active/components/popup-header-green.png'),
    title: require('@/assets/images/active/vip/title-bg-green.png'),
    contextBg: 'rgba(46, 54, 44, 1)',
  },
  blueWhite: {
    header: require('@/assets/images/active/components/popup-header-blue.png'),
    title: require('@/assets/images/active/vip/title-bg-blue.png'),
    contextBg: 'rgba(237, 242, 255, 1)',
  },
  orangeWhite: {
    header: require('@/assets/images/active/components/popup-header-orange.png'),
    title: require('@/assets/images/active/vip/title-bg-orange.png'),
    contextBg: 'rgba(254, 244, 232, 1)',
  },
};

export const firstDepositFeedbackDataImages: any = {
  greenBlack: {
    total: {
      '1': require('@/assets/images/active/firstDeposit/total-green1.png'),
      '2': require('@/assets/images/active/firstDeposit/total-green2.png'),
      '3': require('@/assets/images/active/firstDeposit/total-green3.png'),
      '4': require('@/assets/images/active/firstDeposit/total-green4.png'),
    },
    right: {
      '1': require('@/assets/images/active/firstDeposit/right-green1.png'),
      '2': require('@/assets/images/active/firstDeposit/right-green2.png'),
    },
    left: require('@/assets/images/active/firstDeposit/left-green.png'),
    status: {
      '1': require('@/assets/images/active/firstDeposit/status-green1.png'),
      '2': require('@/assets/images/active/firstDeposit/status-green2.png'),
      '3': require('@/assets/images/active/firstDeposit/status-green3.png'),
      '4': require('@/assets/images/active/firstDeposit/status-green4.png'),
    },
  },
  blueWhite: {
    total: {
      '1': require('@/assets/images/active/firstDeposit/total-blue1.png'),
      '2': require('@/assets/images/active/firstDeposit/total-blue2.png'),
      '3': require('@/assets/images/active/firstDeposit/total-blue3.png'),
      '4': require('@/assets/images/active/firstDeposit/total-blue4.png'),
    },
    right: {
      '1': require('@/assets/images/active/firstDeposit/right-blue1.png'),
      '2': require('@/assets/images/active/firstDeposit/right-blue2.png'),
    },
    left: require('@/assets/images/active/firstDeposit/left-blue.png'),
    status: {
      '1': require('@/assets/images/active/firstDeposit/status-green1.png'),
      '2': require('@/assets/images/active/firstDeposit/status-blue2.png'),
      '3': require('@/assets/images/active/firstDeposit/status-blue3.png'),
      '4': require('@/assets/images/active/firstDeposit/status-blue4.png'),
    },
  },
  orangeWhite: {
    total: {
      '1': require('@/assets/images/active/firstDeposit/total-orange1.png'),
      '2': require('@/assets/images/active/firstDeposit/total-orange2.png'),
      '3': require('@/assets/images/active/firstDeposit/total-orange3.png'),
      '4': require('@/assets/images/active/firstDeposit/total-orange4.png'),
    },
    right: {
      '1': require('@/assets/images/active/firstDeposit/right-orange1.png'),
      '2': require('@/assets/images/active/firstDeposit/right-orange2.png'),
    },
    left: require('@/assets/images/active/firstDeposit/left-orange.png'),
    status: {
      '1': require('@/assets/images/active/firstDeposit/status-green1.png'),
      '2': require('@/assets/images/active/firstDeposit/status-orange2.png'),
      '3': require('@/assets/images/active/firstDeposit/status-orange3.png'),
      '4': require('@/assets/images/active/firstDeposit/status-orange4.png'),
    },
  },
}

export const walletTheme: any = {
  greenBlack: {
    menuBg: require('@/assets/images/wallet/wallet-center-bg-green.png'),
    menuBorderColor: '#c4ffcf',
  },
  blueWhite: {
    menuBg: require('@/assets/images/wallet/wallet-center-bg-blue.png'),
    menuBorderColor: '#ffce90',
  },
  orangeWhite: {
    menuBg: require('@/assets/images/wallet/wallet-center-bg-orange.png'),
    menuBorderColor: '#98b8ff',
  },
}