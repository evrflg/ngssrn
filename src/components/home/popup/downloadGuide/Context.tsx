import { createContext, ReactNode, useContext } from "react";

interface DownloadGuideContextValue {
  guideInstallConfig: any;
  appInfo: any;
  goLandingPage: boolean;
  pwaInstallable: boolean;
  isPwaInstalled: boolean;
  /** web 渠道 id（?ch=xxx），无则视为默认弹窗 */
  channelId: string | null;
  onInstall: () => void;
  isDontPopupAgain: boolean;
  onToggleDontPopup: () => void;
}

const DownloadGuideContext = createContext<DownloadGuideContextValue | null>(null);

interface DownloadGuideProviderProps {
  value: DownloadGuideContextValue;
  children: ReactNode;
}

export const DownloadGuideProvider = ({
  value,
  children,
}: DownloadGuideProviderProps) => {
  return (
    <DownloadGuideContext.Provider value={value}>
      {children}
    </DownloadGuideContext.Provider>
  );
};

export const useDownloadGuideContext = () => {
  const context = useContext(DownloadGuideContext);
  if (!context) {
    throw new Error("useDownloadGuideContext must be used within DownloadGuideProvider");
  }

  return context;
};
