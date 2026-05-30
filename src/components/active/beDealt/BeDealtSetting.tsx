const BeDealtSetting = {
  //preferentialType//1-活动中心 2--任务中心 3--实时返水 4--余额生金 5--VIP奖励
  getSourceType: (item: any, t: Function): string => {
    switch (item.sourceCatalog) {
      case "activity_type":
        return t("pageName.activity");
      case "task_type":
        return t("pageName.task");
      case "rebate_type":
        return t("pageName.rebate");
      default:
        return "-";
    }
  },

  getRewardName: (item: any, t: Function): string => {
    switch (item.sourceType) {
      case 1:
        return t("mission.dailyTask");
      case 0:
        return t("mission.NEW_MEMBER_BONUS-task");
      case 2:
        return t("mission.weeklyTask");
      default:
        return "-";
    }
  },

  //pickStatus//0--领取 1--已领取
  pickStatus: (item: any, t: Function): string => {
    switch (item.status) {
      case 0:
        return t("status.claim.claim");
      case 1:
        return t("status.claim.claimed");
      default:
        return "-";
    }
  },

  //   taskTargetType 1--累计充值 2--累计有效投注
  taskTargetType: (item: any, t: Function): string => {
    switch (item.taskTargetType) {
      case 1:
        return t("active.center.promotion.ljcz");
      case 2:
        return t("active.bedealt.ljtouzhu");
      default:
        return "-";
    }
  },

  // newArrivalType 任务类型: 1 首次下载安装并登陆APP 2 注册账号 3 首次绑定银行卡 4 设置取款密码 5 设置生日  7 首次提现
  newArrivalType: (item: any, t: Function): string => {
    if (item.actType === 1) {
      switch (item.newArrivalType) {
        case 1:
          return t("active.bedealt.scdown");
        case 2:
          return t("active.bedealt.zczh");
        case 3:
          return t("active.bedealt.scbank");
        case 4:
          return t("setting.set-withdrawal-password");
        case 5:
          return t("active.bedealt.setbirth");
        case 7:
          return t("active.bedealt.sctixian");
        default:
          return "-";
      }
    } else {
      return item.actName ?? "-";
    }
  },
};

export default BeDealtSetting;
