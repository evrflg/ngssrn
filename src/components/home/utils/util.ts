import { getAutoExchangeServer, jumpGames } from "@/api";
import {
  changeGameTipPopupData,
  changeIsNeedAutoExchange,
  changeIsShowGameModel,
  changeIsShowGameTipPopup,
  updateGameWebViewData,
} from "@/store/game/gameSlice";
import { accInfoAsync, changeIsShowTestUserPopup } from "@/store/user/userSlice";
import { getStoreJson, setStoreJson } from "@/utils/storage";
import { AppState, Linking, Platform } from "react-native";
const isWeb = Platform.OS === "web";
const gamesType = /yg|iyg|ptn|cq9|bbin2|rsg/i;
let ispass = true; // 防抖变量
// 后台久了回来：若上次 jumpGames Promise 丢失/被系统挂起导致 ispass 未复位，会出现“点击一闪但进不去/后续都点不了”
// 这里在回到前台时兜底复位一次，避免软锁死。
let __isPassAppStateSubInstalled = false;
if (!__isPassAppStateSubInstalled && Platform.OS !== "web") {
  __isPassAppStateSubInstalled = true;
  AppState.addEventListener("change", (s) => {
    if (s === "active") {
      ispass = true;
    }
  });
}
// 需要横屏游玩的游戏
export function checkGameNeedRotate(name: string) {
  return gamesType.test(name);
}
let timer1: ReturnType<typeof setTimeout> | null = null;
let timer2: ReturnType<typeof setTimeout> | null = null;
let timer3: ReturnType<typeof setTimeout> | null = null;

let timer4: ReturnType<typeof setTimeout> | null = null;

/** needPopup 链式定时（60s/150s/240s）；关闭游戏弹框后应停止再弹 */
export function clearGameNeedPopupScheduleTimers() {
  if (timer1) {
    clearTimeout(timer1);
    timer1 = null;
  }
  if (timer2) {
    clearTimeout(timer2);
    timer2 = null;
  }
  if (timer3) {
    clearTimeout(timer3);
    timer3 = null;
  }
  if (timer4) {
    clearTimeout(timer4);
    timer4 = null;
  }
}

// 额度自动转出功能
export const autoExchangeAccInfo = (dispatch: any, id: number) => {
  clearGameNeedPopupScheduleTimers();
  return new Promise((resolve, reject) => {
    getAutoExchangeServer({ id: id, walletType: 0 })
      .then((res: any) => {
        if (res?.data?.data) {
          dispatch(accInfoAsync());
          setStoreJson("lastGame", null);
          resolve(res);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// 跳转游戏
export const goToThreeGame = (
  id: string,
  gameItem: any,
  dispatch: any,
  userInfo: { bonus: number, money: number,isTestUser: boolean },
  toast: any,
  t: any,
  isTestEev?: boolean,
) => {
  // 试玩用户不能玩非8类型游戏
  if(userInfo?.isTestUser && (gameItem?.gameType != 8)){
    dispatch(changeIsShowTestUserPopup(true));
    return;
  }
  dispatch(changeIsNeedAutoExchange(true));

  //防抖处理
  if (!ispass) return;
  ispass = false;
  let safetyTimer: any = null;
  // 极端情况下（后台挂起/网络层异常）Promise 不 resolve/reject，会导致 ispass 永远 false
  safetyTimer = setTimeout(() => {
    ispass = true;
  }, 15000);

  const cash = userInfo?.money ?? 0;
  const bonus = userInfo?.bonus ?? 0;
  // 彩金额比现金多才以彩金钱包进游戏（默认现金）
  const walletType = bonus > cash ? 1 : 0;

  jumpGames({ id, walletType })
    .then((raw: any) => {
      if (safetyTimer) clearTimeout(safetyTimer);
      ispass = true;
    const res = raw?.data;
    const payload = res?.data;
    const needPopup = payload?.needPopup;
    const gameUrl = payload?.url;

    /** 外链 / 内置 WebView 打开游戏（与 needPopup 分支、res.data 成功分支一致） */
    const openGameFromUrl = () => {
      // if (gameItem?.gameType == 8&&(!isTestEev)) {
      //   if (isWeb) {
      //     window.location.href = gameUrl;
      //   } else {
      //     Linking.openURL(gameUrl);
      //   }
      // } else {
        dispatch(updateGameWebViewData({ url: gameUrl, gameId: id }));
        dispatch(changeIsShowGameModel(true));
      // }
    };

    const persistSessionAndRecent = (recentEntry: any) => {
      setStoreJson("lastGame", { url: gameUrl, gameId: id });
      addCurrenGames(recentEntry);
    };

    // 是否返回 needPopup：true 弹余额不足提示，仍写 lastGame / 最近（条目为 url+id）
    if (needPopup == true) {
      if (gameItem?.gameType == 8) {
        dispatch(changeIsShowGameTipPopup(true));
        dispatch(
          changeGameTipPopupData({
            tipType: 1,
            gameUrl,
            gameId: id,
            gameType: gameItem?.gameType,
          }),
        );
        persistSessionAndRecent(gameItem);
        return;
      }
      //第一个弹窗 【可以关闭继续游戏】 60秒后弹出第二个弹窗
      timer1 = setTimeout(() => {
        //如果当前页面为游戏页面，则弹出第二个弹窗
        dispatch(changeIsShowGameTipPopup(true));
        dispatch(
          changeGameTipPopupData({
            tipType: 4,
          }),
        );
      }, 60000);
      //第二个弹窗 【可以关闭继续游戏】 150秒后弹出第三个弹窗
      timer2 = setTimeout(() => {
        dispatch(changeIsShowGameTipPopup(true));
        dispatch(
          changeGameTipPopupData({
            tipType: 5,
          }),
        );
      }, 150000);
      //第三个弹窗 【要强制跳转到充值页面】
      timer3 = setTimeout(() => {
        dispatch(changeIsShowGameTipPopup(true));
        dispatch(
          changeGameTipPopupData({
            tipType: 6,
          }),
        );
      }, 240000);
      persistSessionAndRecent(gameItem);
    }
   
    if (needPopup == false) {
      openGameFromUrl();
      persistSessionAndRecent(gameItem);
      return;
    }
    if (res.data) {
      openGameFromUrl();
      persistSessionAndRecent(gameItem);
      return;
    }

    const errorMsg = t(res.code);
    const value = getValuesFromMsg(res?.msg);
    if (res.code == "1008000001") {
      dispatch(changeIsShowGameTipPopup(true));
      dispatch(
        changeGameTipPopupData({
          tipType: 2,
          errorMsg: errorMsg.replace("[]", ""),
          value: value.replace("[]", ""),
        }),
      );
    } else if (res.code == "1008000003") {
      dispatch(changeIsShowGameTipPopup(true));
      dispatch(
        changeGameTipPopupData({
          tipType: 3,
          errorMsg: errorMsg.replace("[]", ""),
          value,
        }),
      );
    } else {
      toast.error(errorMsg);
    }
    })
    .catch((err: any) => {
      if (safetyTimer) clearTimeout(safetyTimer);
      ispass = true;
      // 后台回来常见：请求被系统中断/超时。这里给出统一提示，避免“点了闪一下没反应”
      const msg =
        err?.message ||
        (typeof err === "string" ? err : "") ||
        t?.("common.networkError") ||
        "network error";
      toast?.error?.(msg);
    });
};

// 添加到收藏夹
export const addFavoriteGames = async (item: any, refreshData: any) => {
  let list = (await getStoreJson("favoriteGames")) || [];
  // 检查是否已经收藏
  let isExist = list.some((game: any) => game.name === item.name);
  if (!isExist) {
    item.isSave = true;
    await setStoreJson("favoriteGames", [...[item], ...list]);
  } else {
    // 如果已经收藏，则从列表中移除
    list = list.filter((game: any) => game.name !== item.name);
    await setStoreJson("favoriteGames", list);
  }
  refreshData();
};

// 添加最近游戏
export const addCurrenGames = async (gameItem: any) => {
  let list = (await getStoreJson("currenGameArr")) || [];
  // 检查是否已经收藏
  let isExist = list.some((game: any) => game.name === gameItem.name);
  if (!isExist) {
    await setStoreJson("currenGameArr", [...[gameItem], ...list]);
  }
};

export function fillBracketPlaceholders(message: string, values?: string[]): string {
  if (!values?.length || !message.includes('[]')) return message
  let index = 0
  return message.replace(/\[\]/g, () => values[index++] ?? '[]')
}

/**
 * 从消息中获取值 获取{}中的值
 * @param message 消息
 * @param option 选项
 * @returns 值
 */
export function getValuesFromMsg(message: string){
  let values = message.match(/\{(.*?)\}/g)?.map(match => match.slice(1, -1)) ?? []
  if(values.length > 0){
    return values[0]
  }
  return ''
}