import { Redirect } from "expo-router";

/**
 * 统一将 tabs 根路由重定向到首页，避免 index 空页面导致黑屏。
 */
const Index = () => {
  return <Redirect href="/home" />;
};

export default Index;
