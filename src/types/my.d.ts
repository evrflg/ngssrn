export interface UserTeamOverviewInfo {
  statsDate: Record<string, unknown>[];

    /*余额 */
    balance: number;

    /*团队提款 */
    withdrawalAmount: number;

    /*团队存款 */
    depositAmount: number;

    /*首充人数 */
    firstDepositCount: number;

    /*代理返点 */
    rebateAmount: number;

    /*新增人数 */
    newMemberCount: number;

    /*三天未登录人数 */
    threeDayNotLoginMemberCount: number;

    /*在线人数 */
    onlineMemberCount: number;

    /*投注人数 */
    betMemberCount: number;

    /*团队代理人数 */
    teamProxyCount: number;

    /*团队会员人数 */
    teamMemberCount: number;
}

export interface TeamGameOverviewItem {
  /*统计日期 */
  statsDate: string;

  /*真人投注 */
  liveBetAmount: number;

  /*真人实际打码 */
  liveBetNum: number;

  /*真人中奖金额 */
  liveWinAmount: number;

  /*真人反水 */
  liveCashbackAmount: number;

  /*真人投注次数 */
  liveBetCount: number;

  /*真人中奖次数 */
  liveWinCount: number;

  /*电子投注 */
  egameBetAmount: number;

  /*电子实际打码 */
  egameBetNum: number;

  /*电子中奖金额 */
  egameWinAmount: number;

  /*电子反水 */
  egameCashbackAmount: number;

  /*电子投注次数 */
  egameBetCount: number;

  /*电子中奖次数 */
  egameWinCount: number;

  /*体育投注 */
  sportBetAmount: number;

  /*体育实际打码 */
  sportBetNum: number;

  /*体育中奖金额 */
  sportWinAmount: number;

  /*体育反水 */
  sportCashbackAmount: number;

  /*体育投注次数 */
  sportBetCount: number;

  /*体育中奖次数 */
  sportWinCount: number;

  /*体育投注 */
  lotteryBetAmount: number;

  /*体育实际打码 */
  lotteryBetNum: number;

  /*体育中奖金额 */
  lotteryWinAmount: number;

  /*体育反水 */
  lotteryCashbackAmount: number;

  /*体育投注次数 */
  lotteryBetCount: number;

  /*体育中奖次数 */
  lotteryWinCount: number;

  /*棋牌投注 */
  chessBetAmount: number;

  /*棋牌实际打码 */
  chessBetNum: number;

  /*棋牌中奖金额 */
  chessWinAmount: number;

  /*棋牌反水 */
  chessCashbackAmount: number;

  /*棋牌投注次数 */
  chessBetCount: number;

  /*棋牌中奖次数 */
  chessWinCount: number;

  /*捕鱼投注 */
  fishingBetAmount: number;

  /*捕鱼实际打码 */
  fishingBetNum: number;

  /*捕鱼中奖金额 */
  fishingWinAmount: number;

  /*捕鱼反水 */
  fishingCashbackAmount: number;

  /*捕鱼投注次数 */
  fishingBetCount: number;

  /*捕鱼中奖次数 */
  fishingWinCount: number;

  /*电竞投注 */
  esportBetAmount: number;

  /*电竞实际打码 */
  esportBetNum: number;

  /*电竞中奖金额 */
  esportWinAmount: number;

  /*电竞反水 */
  esportCashbackAmount: number;

  /*电竞投注次数 */
  esportBetCount: number;

  /*电竞中奖次数 */
  esportWinCount: number;
};
