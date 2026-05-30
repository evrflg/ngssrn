const blueWhiteRgb = "71, 129, 255"
const orangeWhite = "244,141,22"
export const bgMap: any = {
  greenBlack: {
    bgcolor: "#202222",
    bgimg: require("@/assets/images/login/bgGreen.png"),
    bgTopImg: require('@/assets/images/login/greenup.png'),
    bgBlock: ["rgba(41, 44, 43, 0.5)", "rgba(117, 235, 146, 0.5)"],
    tabBlock: [`rgba(41, 44, 43, 0.50)`, `rgba(117, 235, 146, 0.50)`]
  },
  blueWhite: {
    bgcolor: "#bccbeb",
    bgimg: require("@/assets/images/login/bgBlue.png"),
    bgTopImg: require('@/assets/images/login/blueup.png'),
    bgBlock: [`rgba(235,236,243,.5)`, `rgba(${blueWhiteRgb},.8)`],
    tabBlock: ['rgba(71, 129, 255, 0.50)', 'rgba(235, 236, 243, 0.50)']
  },
  orangeWhite: {
    bgcolor: "#dbcab7",
    bgimg: require("@/assets/images/login/bgOrange.png"),
    bgTopImg: require('@/assets/images/login/orangeup.png'),
    bgBlock: [`rgba(${orangeWhite},.1)`, `rgba(${orangeWhite},.5)`],
    tabBlock: [`rgba(244, 141, 22, 0.50)`, `rgba(235, 236, 243, 0.50)`]
  },
}
