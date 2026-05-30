// ios打包域名
const DOMAIN_URL_IOS = "https://ngss2test.ngss.bet/";
// const DOMAIN_URL_IOS = "https://ng3web9.ngss.bet";
//  https://skybx101.yb876.com/https://ng3web6.ngss.bet/

// android打包域名
const DOMAIN_URL_ANDROID = "https://ngss2test.ngss.bet/";
// https://ngss2test.ngss.bet/ https://skybx101.yb876.com

// bundleId 目前项目ios、android用的同一个配置
const BUNDLE_ID = "com.ngss.rn.t300";
// app name 线上打包使用
const NAME = "ngss-native测试";
// app name 本地开发使用，打包的iosapp项目名这些会自动过滤中文生成，改变时expo prebuild --clean 重新构建

const config = {
  t300: {
    // isBx112: true,
    showTabAwardAmount: true, // 提款页面显示当前打码量
    // isYd112: true,
    isCeshi: true,
    loginActive: 2, //登录默认项
  },
};

function defineFrontConfig(stationCode) {
  return config[stationCode] || {};
}

module.exports = {
  DOMAIN_URL_IOS,
  DOMAIN_URL_ANDROID,
  BUNDLE_ID,
  NAME,
  defineFrontConfig,
};
