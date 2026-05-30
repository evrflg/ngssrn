## 在xxx毫秒内只允许一次执行

同一个 `key` 在指定毫秒内只会放行一次，适合 `useEffect`、`useFocusEffect`、接口请求前置去重。
`clearDedupKey` 是可选的：当你希望“立刻重新允许触发”时再调用。

```js
import { allowOnceInWindow, clearDedupKey } from "@/utils/dedup";

// xxx内不重复请求
if (!allowOnceInWindow("home:indexHeader:focusEffect", 30_000)) return;

// 需要立刻允许再次触发时，清掉该 key 记录
clearDedupKey("home:indexHeader:focusEffect");
```

## 防抖

用于高频触发场景（搜索输入、按钮连点）。  
`false` 表示尾触发（最后一次后执行），默认 `true` 表示首触发（第一次立即执行）。
一般在组件卸载或场景切换时调用 `cancel()`，避免延迟任务误触发。

```js
import { debounce } from "@/utils/debounce";

// 搜索
const onSearch = debounce(() => {}, 300, false);

// 普通按钮点击
const onClick = debounce(() => {}, 300);

// 取消尚未执行的调用，并清空计时状态
onSearch.cancel();
```

## 延迟渲染

延后渲染重内容，降低首屏阶段的渲染压力。

```js
import { useDelayedRender } from "@/hooks/useDelayedRender";

// 延迟渲染
const shouldRender = useDelayedRender({ delay: 1000 });

if (!shouldRenderPopups) return null;
```

## 未登录时跳转登录页并返回 false

把“登录校验 + 跳转登录页”封装成一个布尔判断，便于在事件里直接 `return`。

```js
import { useRequireLogin } from "@/hooks/useRequireLogin";

// 未登录时跳转登录页并返回 false；已登录返回 true
const { ensureLogin } = useRequireLogin();

if (!ensureLogin()) return;
```

## 域名管理 配置

测试站显示全部语言、社区活动等需要用到

```js
import { getCurrentConfig } from "@/config/domainConfig";

// 聊天室功能是否开启
const showChatting = useMemo(() => {
  const domainConfig = getCurrentConfig();
  return domainConfig.showChatting === true;
}, []);
```

## 不显示接口公共报错提示

```js
// 1）封装第三参数
get("/api/foo", { id: 1 }, { silentErrorToast: true });

// 2）写在查询参数对象里（会自动剔除，不拼进 URL）
get("/api/foo", { id: 1, silentErrorToast: true });

// 3）POST 第五个参数
post("/api/bar", { a: 1 }, false, undefined, { silentErrorToast: true });

// 4）POST body 里带（会从 body 里删掉再发）
post("/api/bar", { a: 1, silentErrorToast: true });
```
