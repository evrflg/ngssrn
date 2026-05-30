/**
 * 与 ngss-vue3 App.vue 中 siteStatisticCode 注入逻辑对齐（仅 Web 有 document）。
 *
 * 后台可能配置：
 * - 外链：`<script src="https://..."></script>`（含 async/defer/type 等属性一并复制）
 * - 内联：`<script>...js...</script>`
 * - 片段：`<img />`、`<noscript>` 等（按 HTML 挂到 body）
 * - 纯 JS：无标签，如 `alert('x')`、`gtag('config',...)` 整段当脚本执行
 *
 * 说明：通过 innerHTML 插入的 script 在内存里默认不执行，故克隆到新 script 再 append 到 body；
 * 带 src 的脚本由浏览器拉取执行，不必写 textContent。
 */

let insertedNodes: HTMLElement[] = [];
let lastSiteStatisticCode = "";

// 清除已插入的节点
function clearInserted(): void {
  insertedNodes.forEach((el) => {
    try {
      el.remove();
    } catch {
      /* ignore */
    }
  });
  insertedNodes = [];
}

// 克隆可执行的脚本
function appendExecutableScriptClone(oldScript: HTMLScriptElement): void {
  const fresh = document.createElement("script");
  Array.from(oldScript.attributes).forEach((attr) => {
    fresh.setAttribute(attr.name, attr.value);
  });
  const src = oldScript.getAttribute("src");
  if (!src || !String(src).trim()) {
    fresh.textContent = oldScript.textContent || "";
  }
  document.body.appendChild(fresh);
  insertedNodes.push(fresh);
}

// 执行统计脚本
export function executeSiteStatisticCodeWeb(htmlString: string): void {
  if (typeof document === "undefined") return;

  const code = String(htmlString || "").trim();
  if (!code) {
    clearInserted();
    lastSiteStatisticCode = "";
    return;
  }
  if (code === lastSiteStatisticCode) return;

  clearInserted();

  const container = document.createElement("div");
  container.innerHTML = code;

  const scripts = [...container.querySelectorAll("script")];
  scripts.forEach((s) => appendExecutableScriptClone(s));
  scripts.forEach((s) => s.remove());

  const hasElementChildren = container.children.length > 0;

  if (scripts.length === 0 && !hasElementChildren) {
    // 无标签纯 JS，或 innerHTML 后只剩文本节点（如 alert(1)）
    const text = (container.textContent ?? "").trim() || code;
    if (text) {
      const s = document.createElement("script");
      s.textContent = text;
      document.body.appendChild(s);
      insertedNodes.push(s);
    }
  } else {
    while (container.firstChild) {
      const n = container.firstChild;
      document.body.appendChild(n);
      if (n instanceof HTMLElement) insertedNodes.push(n);
    }
  }

  lastSiteStatisticCode = code;
}

// 移除统计脚本
export function removeSiteStatisticCodeWeb(): void {
  if (typeof document === "undefined") return;
  clearInserted();
  lastSiteStatisticCode = "";
}

/**
 * 原生 WebView 用整页 HTML：内联执行与上面 `executeSiteStatisticCodeWeb` 等价的逻辑。
 *
 * 不能把后台字符串直接拼进 `<body>...</body>`：
 * - 纯 JS（无标签）只会变成文本节点，不会执行；
 * - 仅靠静态 HTML 解析时，部分 WebView 对 body 内 script 的执行时机与桌面浏览器不一致。
 *
 * iOS 触摸桥：`pointer-events:none` 只能让 WebKit 内部不派发 click，**iOS WKWebView 这个 UIView**
 * 仍然在原生层吃掉触摸（其 UIScrollView 把 touch 收走），导致全屏覆盖时整页点不动。
 * 这里在 WebView 里跑一段 observer，检测 body 下「真正可见的非脚本子元素」是否存在，
 * 通过 `postMessage({type:'siteStatisticInteractive', visible})` 告诉 RN 该不该让自己吃触摸。
 */
export const SITE_STATISTIC_RN_MESSAGE_TYPE = "siteStatisticInteractive";

export function buildSiteStatisticWebViewHtml(code: string): string | null {
  const raw = String(code || "").trim();
  if (!raw) return null;

  const enc = encodeURIComponent(raw);
  const encLiteral = JSON.stringify(enc).replace(/</g, "\\u003c");
  const msgTypeLiteral = JSON.stringify(SITE_STATISTIC_RN_MESSAGE_TYPE);

  const bootstrap = `(function(){
var code=decodeURIComponent(${encLiteral});
var inserted=[];
function clr(){inserted.forEach(function(el){try{el.remove()}catch(e){}});inserted=[]}
clr();
var c=document.createElement("div");
c.innerHTML=code;
var scripts=[].slice.call(c.querySelectorAll("script"));
scripts.forEach(function(old){
var f=document.createElement("script");
for(var i=0;i<old.attributes.length;i++){var a=old.attributes[i];f.setAttribute(a.name,a.value)}
var src=old.getAttribute("src");
if(!src||!String(src).trim()){f.textContent=old.textContent||""}
document.body.appendChild(f);
inserted.push(f);
});
scripts.forEach(function(s){s.remove()});
var hasEl=c.children.length>0;
if(scripts.length===0&&!hasEl){
var t=(c.textContent||"").trim()||code;
if(t){var x=document.createElement("script");x.textContent=t;document.body.appendChild(x);inserted.push(x)}
}else{
while(c.firstChild){var n=c.firstChild;document.body.appendChild(n);if(n.nodeType===1)inserted.push(n)}
}
})();`;

  /**
   * 触摸桥：扫 body 直接子元素，跳过 script/style/noscript/meta/link，跳过 display:none / visibility:hidden / opacity:0，
   * 任一子树里出现「可见且尺寸 > 0」的元素就算 interactive。
   * - 第三方浮窗（LiveChat、客服 widget）通常通过 iframe 或 div 挂到 body。
   * - 用 MutationObserver 监听 body 子树 + 周期兜底，状态变化才 post。
   */
  const touchBridge = `(function(){
var TYPE=${msgTypeLiteral};
var last=null;
function bridge(){try{return window.ReactNativeWebView&&window.ReactNativeWebView.postMessage}catch(e){return null}}
function hasVisible(){
  if(!document.body) return false;
  var vw=window.innerWidth||document.documentElement.clientWidth||0;
  var vh=window.innerHeight||document.documentElement.clientHeight||0;
  if(!vw||!vh) return false;
  /**
   * 关键阈值：rect 短边占 viewport 短边 ≥ 80% 才算大面板（客服对话框 / 全屏 modal）。
   * - 用相对比例而不是绝对像素：默认 WebView 物理尺寸 240×240，viewport 短边是 240，
   *   60×60 的 trigger 按钮（短边 60 / 240 = 25%）→ 不算；
   *   widget 撑满成 240×240 的对话框（100%）→ 算。
   * - 切到 absoluteFill 后 viewport 是全屏（如 375×667），对话框仍然 ≥ 80%，判定保持 true，不会抖动。
   */
  var minSide=Math.min(vw,vh);
  var THRESHOLD=minSide*0.8;
  var kids=document.body.children;
  for(var i=0;i<kids.length;i++){
    var c=kids[i];
    var tag=(c.tagName||"").toUpperCase();
    if(tag==="SCRIPT"||tag==="STYLE"||tag==="NOSCRIPT"||tag==="META"||tag==="LINK"||tag==="TEMPLATE") continue;
    var cs;
    try{cs=window.getComputedStyle(c)}catch(e){continue}
    if(!cs) continue;
    if(cs.display==="none") continue;
    if(cs.visibility==="hidden") continue;
    if(cs.pointerEvents==="none") continue;
    var op=parseFloat(cs.opacity||"1");
    if(!isNaN(op)&&op<=0) continue;
    var r;
    try{r=c.getBoundingClientRect()}catch(e){continue}
    if(!r) continue;
    var shortSide=Math.min(r.width,r.height);
    if(shortSide<THRESHOLD) continue;
    if(r.right<=0||r.bottom<=0) continue;
    if(r.left>=vw||r.top>=vh) continue;
    return true;
  }
  return false;
}
function post(v){
  if(last===v) return;
  last=v;
  var fn=bridge();
  if(!fn) return;
  try{fn.call(window.ReactNativeWebView,JSON.stringify({type:TYPE,visible:v}))}catch(e){}
}
function check(){post(hasVisible())}
var pending=false;
function schedule(){
  if(pending) return;
  pending=true;
  setTimeout(function(){pending=false;check()},120);
}
// 初始报一次「false」，避免 RN 上来就开放触摸
setTimeout(function(){post(false)},0);
setTimeout(check,80);
setTimeout(check,400);
setTimeout(check,1200);
try{
  var mo=new MutationObserver(schedule);
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["style","class","hidden"]});
}catch(e){}
// viewport size 变化也立即重判（host 240×240 ↔ absoluteFill 切换会触发）
try{
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("orientationchange",schedule,{passive:true});
}catch(e){}
setInterval(schedule,2000);
})();`;

  // 透明底：浮层类统计（如 LiveChat）才能叠在 App 上被看到；否则白底盖住 RN
  const shellHead = `<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><style>html,body{margin:0;background:transparent!important;min-height:100%}</style>`;

  return `<!DOCTYPE html><html><head>${shellHead}</head><body><script>${bootstrap}</script><script>${touchBridge}</script></body></html>`;
}
