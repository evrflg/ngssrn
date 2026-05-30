import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { useCommon } from "@/hooks/CommonProvider";
import { useDispatch,} from "react-redux";
import { accInfoAsync } from "@/store/user/userSlice";
import { autoExchangeAccInfo } from "../utils/util";
import { getStoreJson } from "@/utils/storage";

export function useHomePullToRefresh() {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const inFlightRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setRefreshing(true);
      await Promise.allSettled([
        Promise.resolve(dispatch(accInfoAsync() as any)),
        getStoreJson("lastGame").then((res: any) => {
          if (res?.gameId) {
            autoExchangeAccInfo(dispatch, res?.gameId);
          }
        }),
      ]);
    } catch (error) {
      console.error("刷新失败:", error);
    } finally {
      if (Platform.OS === "web") {
        requestAnimationFrame(() => setRefreshing(false));
      } else {
        setRefreshing(false);
      }
      inFlightRef.current = false;
    }
  }, [accInfoAsync]);

  return { refreshing, onRefresh };
}

