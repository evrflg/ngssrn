import { tenantStore } from "@/store/tenant/tenantSlice";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

/**
 * Station-specific i18n (same as ngss-vue useStationI18n).
 * Locale keys: `{baseKey}-{tenantCode}`, e.g. `telegram-bind-description-ZT031700000513`.
 */
export function useStationI18n() {
  const { t, i18n } = useTranslation();
  const tenant = useSelector(tenantStore);

  const getKey = useCallback(
    (key: string) => `${key}-${tenant?.code ?? ""}`,
    [tenant?.code],
  );

  const translationExists = useCallback(
    (key: string) => i18n.exists(getKey(key)),
    [getKey, i18n],
  );

  const translation = useCallback(
    (key: string, options?: Record<string, unknown>) => {
      const stationKey = getKey(key);
      return i18n.exists(stationKey) ? t(stationKey, options) : t(key, options);
    },
    [getKey, i18n, t],
  );

  return { translation, translationExists };
}
