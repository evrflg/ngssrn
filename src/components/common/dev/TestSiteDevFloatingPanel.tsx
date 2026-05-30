import { THEME_OPTIONS } from "@/constants/theme";
import { Colors } from "@/constants/Colors";
import { useCommon } from "@/hooks/CommonProvider";
import { ThemeType, useTheme } from "@/hooks/theme/ThemeProvider";
import { LANGUAGE_NAME_MAP, SUPPORTED_LANGUAGES } from "@/lang/language";
import { stationConfig } from "@/store/tenant/tenantSlice";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { MAX_WIDTH } from "@/hooks/useMaxWidth";
import { getStorage, setStorage } from "@/utils/storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";
import { useSelector } from "react-redux";

const TAB_BAR_OFFSET = 54;
const DEV_PANEL_Z_INDEX = 2147483647;

/** 本地持久化：用户点「不再显示」后隐藏测试站开发浮窗（清缓存或删此 key 可恢复） */
const STORAGE_HIDE_THEME_LANG_PANEL = "ngss-rn-hide-theme-lang-panel";

/** 开发浮窗内主题展示：固定文案，不随 i18n 切换 */
const THEME_DEV_LABEL: Record<(typeof THEME_OPTIONS)[number]["value"], string> =
{
  orangeWhite: "橙白",
  blueWhite: "蓝白",
  greenBlack: "绿黑",
};

/**
 * 仅测试站显示
 * 悬浮快捷切换语言 / 主题，便于全站联调。
 */
export function TestSiteDevFloatingPanel() {
  const siteConfig = useSelector(stationConfig);
  const { language, changeLanguage } = useCommon();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWebPcWide = Platform.OS === "web" && windowWidth > MAX_WIDTH;

  const [open, setOpen] = useState(false);
  /** null：尚未读完本地存储；true：用户选择不再显示 */
  const [hiddenForever, setHiddenForever] = useState<boolean | null>(null);
  const [webFabHost, setWebFabHost] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const v = await getStorage(STORAGE_HIDE_THEME_LANG_PANEL);
      if (!cancelled) {
        setHiddenForever(v === "1");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isWeb || typeof document === "undefined") return;

    const host = document.createElement("div");
    host.setAttribute("data-dev-fab-host", "test-site-panel");
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = String(DEV_PANEL_Z_INDEX);
    host.style.pointerEvents = "none";
    document.body.appendChild(host);
    setWebFabHost(host);

    return () => {
      setWebFabHost(null);
      host.remove();
    };
  }, [isWeb]);

  const languages = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((code) => ({
        code,
        name: LANGUAGE_NAME_MAP.get(code) ?? code,
      })),
    [],
  );

  const shouldShowPanel =
    Boolean(siteConfig?.isTestSite) && hiddenForever !== null && !hiddenForever;

  const winH = Dimensions.get("window").height;
  const bottom = insets.bottom + TAB_BAR_OFFSET + 8;
  const panelMaxH = Math.min(winH * 0.55, 420);
  const fabBottom = isWebPcWide ? Math.max(insets.bottom, 12) + 12 : bottom;

  const panelNode = shouldShowPanel ? (
    <View style={[styles.root, isWeb && styles.rootWebViewport]}>
      {!isWebPcWide && (
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close dev panel"
        />
      )}

      <View
        style={[
          styles.panel,
          styles.panelForceLtr,
          isWebPcWide ? styles.panelWebPc : styles.panelInline,
          {
            bottom: isWebPcWide ? fabBottom + 52 : bottom + 52,
            maxHeight: panelMaxH,
            backgroundColor: Colors[theme].cardBg1,
            borderColor: Colors[theme].primary,
          },
        ]}
        pointerEvents="auto"
      >
        <Text
          style={[
            styles.sectionTitle,
            styles.textForceLtr,
            { color: Colors[theme].text },
          ]}
        >
          语言
        </Text>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContentForceLtr}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {languages.map(({ code, name }) => {
            const active = language === code;
            return (
              <Pressable
                key={code}
                style={[
                  styles.row,
                  styles.rowForceLtr,
                  active && {
                    backgroundColor: Colors[theme].themeColor1 + "33",
                  },
                ]}
                onPress={() => {
                  changeLanguage(code);
                }}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    styles.langNameText,
                    { color: Colors[theme].text },
                  ]}
                  numberOfLines={1}
                >
                  {name}
                </Text>
                <Text
                  style={[
                    styles.rowMeta,
                    styles.langCodeText,
                    { color: Colors[theme].textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {code}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text
          style={[
            styles.sectionTitle,
            styles.sectionTitleSecond,
            styles.textForceLtr,
            { color: Colors[theme].text },
          ]}
        >
          主题
        </Text>
        {THEME_OPTIONS.map((item) => {
          const active = theme === item.value;
          return (
            <Pressable
              key={item.value}
              style={[
                styles.row,
                styles.rowForceLtr,
                active && {
                  backgroundColor: Colors[theme].themeColor1 + "33",
                },
              ]}
              onPress={() => {
                toggleTheme(item.value as ThemeType, undefined);
              }}
            >
              <Text
                style={[
                  styles.rowLabel,
                  styles.textForceLtr,
                  { color: Colors[theme].text },
                ]}
              >
                {THEME_DEV_LABEL[item.value]}
              </Text>
              <Text
                style={[
                  styles.rowMeta,
                  styles.langCodeText,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                {item.value}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={styles.dismissRow}
          onPress={() => {
            void setStorage(STORAGE_HIDE_THEME_LANG_PANEL, "1");
            setHiddenForever(true);
            setOpen(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="不再显示测试站开发浮窗"
        >
          <Text
            style={[
              styles.dismissText,
              styles.textForceLtr,
              { color: Colors[theme].textSecondary },
            ]}
          >
            不再显示
          </Text>
        </Pressable>
      </View>
    </View>
  ) : null;

  const fabNode = shouldShowPanel ? (
    <Pressable
      style={[
        styles.fab,
        isWebPcWide && styles.fabWebPc,
        {
          bottom: fabBottom,
          backgroundColor: Colors[theme].primary,
        },
      ]}
      onPress={() => setOpen((v) => !v)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="测试站开发面板"
    >
      <Ionicons name="flask" size={22} color="#fff" />
    </Pressable>
  ) : null;

  const webFabPortal =
    isWeb && webFabHost && fabNode
      ? (require("react-dom") as typeof import("react-dom")).createPortal(
        <View style={styles.root} pointerEvents="box-none">
          {fabNode}
        </View>,
        webFabHost,
      )
      : null;

  const nativeOverlayContent = (
    <View style={styles.nativeFabOverlay} pointerEvents="box-none">
      {open && panelNode}
      {fabNode}
    </View>
  );

  return (
    <>
      {isWeb && open && panelNode && (
        <Modal
          visible
          transparent
          animationType="none"
          statusBarTranslucent
          {...(Platform.OS === "ios"
            ? ({ presentationStyle: "overFullScreen" } as const)
            : {})}
          onRequestClose={() => setOpen(false)}
        >
          {panelNode}
        </Modal>
      )}

      {isWeb ? (
        webFabPortal
      ) : (
        shouldShowPanel && <FullWindowOverlay>
          {nativeOverlayContent}
        </FullWindowOverlay>

      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: DEV_PANEL_Z_INDEX,
    elevation: DEV_PANEL_Z_INDEX,
  },
  /** Web：相对浏览器视口固定，脱离中间 maxWidth 内容列 */
  rootWebViewport: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: DEV_PANEL_Z_INDEX,
    elevation: DEV_PANEL_Z_INDEX,
  } as const,
  /** Native FAB Modal：全屏占位但仅在 FAB 上接触摸，其余穿透到下层 Modal/页面 */
  nativeFabOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: DEV_PANEL_Z_INDEX,
    elevation: DEV_PANEL_Z_INDEX,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  panel: {
    position: "absolute",
    zIndex: DEV_PANEL_Z_INDEX,
    elevation: DEV_PANEL_Z_INDEX,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  panelInline: {
    left: 10,
    right: 10,
  },
  panelWebPc: {
    left: "auto",
    right: 16,
    width: 300,
    maxWidth: 320,
  },
  /** 站点切到阿语等 RTL 时，避免浮窗内 flex/双向文本跟着整体 RTL */
  panelForceLtr: {
    writingDirection: "ltr",
  },
  scrollContentForceLtr: {
    writingDirection: "ltr",
  },
  rowForceLtr: {
    writingDirection: "ltr",
  },
  textForceLtr: {
    writingDirection: "ltr",
  },
  langNameText: {
    writingDirection: "ltr",
    textAlign: "left",
  },
  langCodeText: {
    writingDirection: "ltr",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  sectionTitleSecond: {
    marginTop: 10,
  },
  scroll: {
    maxHeight: 220,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
  },
  rowMeta: {
    fontSize: 11,
    maxWidth: "42%",
    textAlign: "right",
  },
  fab: {
    position: "absolute",
    zIndex: DEV_PANEL_Z_INDEX,
    elevation: DEV_PANEL_Z_INDEX,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  fabWebPc: {
    right: 20,
  },
  dismissRow: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  dismissText: {
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
