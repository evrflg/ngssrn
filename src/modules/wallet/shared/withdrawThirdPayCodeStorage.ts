import AsyncStorage from "@react-native-async-storage/async-storage";

/** 三方提现 tab 的 payCode（来自 get-withdraws），供列表/创建等接口使用 */
const PAY_CODE_KEY = "ngss_withdraw_third_pay_code";
const TAB_KEY = "ngss_withdraw_tab_id";
const WITHDRAW_TYPE_KEY = "withdrawType";

const THIRD_TAB_IDS = new Set(["type-4", "type-5", "type-6"]);

export function syncWithdrawThirdPayCodeFromTab(tab: { id: string; payCode?: string } | null) {
  if (tab && THIRD_TAB_IDS.has(tab.id) && tab.payCode) {
    void AsyncStorage.setItem(PAY_CODE_KEY, tab.payCode);
  } else {
    void AsyncStorage.removeItem(PAY_CODE_KEY);
  }
}

export async function getWithdrawThirdPayCode(): Promise<string | undefined> {
  const value = await AsyncStorage.getItem(PAY_CODE_KEY);
  return value || undefined;
}

export async function clearWithdrawThirdPayCode() {
  await AsyncStorage.removeItem(PAY_CODE_KEY);
}

export async function syncWithdrawTabId(tabId: string | undefined) {
  if (tabId) {
    await AsyncStorage.setItem(TAB_KEY, tabId);
  }
}

export async function getWithdrawTabId(): Promise<string | undefined> {
  const value = await AsyncStorage.getItem(TAB_KEY);
  return value || undefined;
}

export async function clearWithdrawTabId() {
  await AsyncStorage.removeItem(TAB_KEY);
}

export async function syncWithdrawType(type: string) {
  await AsyncStorage.setItem(WITHDRAW_TYPE_KEY, type);
}

export async function getWithdrawType(): Promise<string | undefined> {
  const value = await AsyncStorage.getItem(WITHDRAW_TYPE_KEY);
  return value || undefined;
}

export async function clearWithdrawType() {
  await AsyncStorage.removeItem(WITHDRAW_TYPE_KEY);
}
