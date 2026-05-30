import { getOnlineInfo, getTaskPageList } from "@/api";
import {
  fetchBatchDictData,
  fetchDictData,
  getDictType,
  Mission,
  MissionCategory,
  shouldShowRechargeMethods,
  TaskRecord,
  transformTaskToMission,
} from "@/components/active/mission/service";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;
const taskTypeMap: Record<MissionCategory, string | undefined> = {
  all: undefined,
  newUserBenefits: "0",
  dailyMissions: "1",
  weeklyMissions: "2",
};

const missionCategories: MissionCategory[] = [
  "all",
  "newUserBenefits",
  "dailyMissions",
  "weeklyMissions",
];

const popupTabToCategoryMap: Record<string, MissionCategory> = {
  "0": "newUserBenefits",
  "1": "dailyMissions",
  "2": "weeklyMissions",
};

const isMissionCategory = (value: string): value is MissionCategory => {
  return missionCategories.indexOf(value as MissionCategory) !== -1;
};

const parseTabToCategory = (
  tab: string | string[] | undefined,
): MissionCategory | null => {
  const rawTab = Array.isArray(tab) ? tab[0] : tab;
  if (!rawTab) return null;

  const normalizedTab = decodeURIComponent(String(rawTab));
  const parsedTab = popupTabToCategoryMap[normalizedTab] ?? normalizedTab;

  return isMissionCategory(parsedTab) ? parsedTab : null;
};

export const useMissions = () => {
  const { t } = useTranslation();
  const { tab } = useLocalSearchParams<{ tab?: string | string[] }>();
  const parsedCategory = useMemo(() => parseTabToCategory(tab), [tab]);
  const [missionList, setMissionList] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const [refreshSeq, setRefreshSeq] = useState(0);
  const [category, setCategory] = useState<MissionCategory>(
    parsedCategory ?? "all",
  );
  const [taskTypeDict, setTaskTypeDict] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMission, selectMission] = useState<Mission | null>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [rechargeMethods, setRechargeMethods] = useState<string[]>([]);
  // refresh 后 FlatList 可能因重排误触发 onEndReached；用短窗口屏蔽一次“自动触底加载”
  const ignoreEndReachedUntilRef = useRef(0);

  const tabs = useMemo(() => {
    const baseTab = { key: "all", label: t("status.allText") };
    if (taskTypeDict.length === 0) {
      // Fallback to i18n if dictionary not loaded yet
      return [
        baseTab,
        { key: "newUserBenefits", label: t("mission.newUserBenefits") },
        { key: "dailyMissions", label: t("mission.dailyMissions") },
        { key: "weeklyMissions", label: t("mission.weeklyMissions") },
      ];
    }

    // Map task types from dictionary (value 0, 1, 2 to category keys)
    const taskTypeMap: Record<string, string> = {
      "0": "newUserBenefits",
      "1": "dailyMissions",
      "2": "weeklyMissions",
    };
    // Use Map to ensure unique keys (prevent duplicates)
    const tabsMap = new Map<string, { key: string; label: string }>();

    taskTypeDict
      .filter((item) => taskTypeMap[item.value])
      .forEach((item) => {
        const key = taskTypeMap[item.value];
        // Only add if not already in map (first occurrence wins)
        if (!tabsMap.has(key)) {
          tabsMap.set(key, {
            key: key,
            label: item.label,
          });
        }
      });

    const dynamicTabs = Array.from(tabsMap.values());
    return [baseTab, ...dynamicTabs];
  }, [taskTypeDict]);
  const showProgress = useMemo(() => {
    const shouldShow =
      category === "dailyMissions" || category === "weeklyMissions";
    const hasMissions = missionList.length > 0;
    const hasValidProgress = progressData && progressData.total > 0;
    return shouldShow && hasValidProgress && hasMissions;
  }, [category, missionList, progressData]);

  const fetchMissionsList = () => {
    setLoading(true);
    getTaskPageList({
      pageNo,
      pageSize: PAGE_SIZE,
      taskType: taskTypeMap[category],
    })
      .then(async ({ data: response }) => {
        let missions = [];
        if (Array.isArray(response.data?.list)) {
          if (response.data.list.length > 0) {
            const dictTypesSet = new Set<string>();
            // Always add common_status and task_type dictionaries
            dictTypesSet.add("common_status");
            dictTypesSet.add("task_type");
            // Add task-specific dictionaries
            response.data.list.forEach((task: TaskRecord) => {
              const dictType = getDictType(task.taskType);
              dictTypesSet.add(dictType);
            });

            const dictTypes = Array.from(dictTypesSet);
            if (dictTypes.length > 0) {
              await fetchBatchDictData(dictTypes);
            }
          }
          // Transform all tasks with dictionary lookup (async)
          missions = await Promise.all(
            response.data.list.map((task: TaskRecord) =>
              transformTaskToMission(task),
            ),
          );
        }
        if (response.data?.statistic) {
          setProgressData({
            current: response.data.statistic.finished || 0,
            total: response.data.statistic.total || 0,
          });
        }
        if (missions.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        if (pageNo === 1) {
          setMissionList(missions);
        } else {
          setMissionList((list: any[]) => {
            list.push(...missions);
            return list;
          });
        }
      })
      .catch(() => {
        setHasMore(false);
        if (pageNo === 1) {
          setMissionList([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchTaskTypeDict = () => {
    setLoading(true);
    fetchDictData("task_type")
      .then((data) => {
        setTaskTypeDict(data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchMore = () => {
    if (loading || !hasMore) return;
    if (Date.now() < ignoreEndReachedUntilRef.current) return;
    setPageNo(pageNo + 1);
  };

  const refresh = useCallback(() => {
    setHasMore(true);
    setPageNo(1);
    setRefreshSeq((v) => v + 1);
    // 600ms 足够覆盖“第一页请求完成后立即触发 onEndReached”的常见窗口
    ignoreEndReachedUntilRef.current = Date.now() + 600;
  }, []);

  const fetchPaymentMethods = () => {
    setLoading(true);
    getOnlineInfo()
      .then(({ data: response }) => {
        if (Array.isArray(response.data)) {
          setPaymentMethods(response.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchRechargeMethods = () => {
    if (!selectedMission) return;
    const showRechargeMethods = shouldShowRechargeMethods(selectedMission);
    if (!showRechargeMethods) return;
    const chargeType = selectedMission.chargeType;
    if (!chargeType) {
      return;
    }

    try {
      // Parse chargeType codes (similar to platformJson handling)
      let chargeCodes: string[] = [];

      if (Array.isArray(chargeType)) {
        chargeCodes = chargeType.map((code) => String(code));
      } else if (typeof chargeType === "object" && chargeType !== null) {
        chargeCodes = Object.values(chargeType).map((code) => String(code));
      } else if (typeof chargeType === "string") {
        try {
          const parsed = JSON.parse(chargeType);
          if (Array.isArray(parsed)) {
            chargeCodes = parsed.map((code) => String(code));
          } else if (typeof parsed === "object" && parsed !== null) {
            chargeCodes = Object.values(parsed).map((code) => String(code));
          }
        } catch {
          // If not JSON, treat as single code
          chargeCodes = [chargeType];
        }
      }

      if (chargeCodes.length === 0) {
        return;
      }

      if (paymentMethods.length === 0) return;
      // Remove duplicate codes
      chargeCodes = [...new Set(chargeCodes)];

      // Match charge codes with payment methods using thirdPayCode in tunnels array
      const matchedMethods: string[] = [];

      chargeCodes.forEach((code) => {
        // Search through all payment methods and their tunnels
        let matched = null;

        for (const method of paymentMethods) {
          // Check if method has tunnels array
          if (method.tunnels && Array.isArray(method.tunnels)) {
            // Search in tunnels array
            const tunnel = method.tunnels.find((t: any) => {
              const thirdPayCode = String(t.thirdPayCode || "").trim();
              return thirdPayCode === code;
            });

            if (tunnel) {
              matched = method;
              break;
            }
          }

          // Also check method itself
          const thirdPayCode = String(method.thirdPayCode || "").trim();
          if (thirdPayCode === code) {
            matched = method;
            break;
          }
        }

        if (matched && matched.payName) {
          matchedMethods.push(matched.payName);
        }
      });
      setRechargeMethods(matchedMethods);
    } catch (error) {
      console.error("[MissionCard] Error fetching recharge methods:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchMissionsList();
  }, [pageNo, category, refreshSeq]);

  useEffect(() => {
    fetchTaskTypeDict();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (!parsedCategory) return;
    if (parsedCategory === category) return;
    setCategory(parsedCategory);
    setPageNo(1);
  }, [parsedCategory, category]);

  useEffect(() => {
    if (paymentMethods.length > 0 && selectedMission) fetchRechargeMethods();
  }, [paymentMethods, selectedMission]);

  return {
    missions: missionList,
    loading,
    hasMore,
    category,
    isExpanded,
    selectedMission,
    progressData,
    tabs,
    showProgress,
    rechargeMethods,
    refresh,
    setCategory,
    setIsExpanded,
    selectMission,
    fetchMore,
    setPageNo,
  };
};
