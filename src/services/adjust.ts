import { Adjust, AdjustConfig, AdjustEvent } from 'react-native-adjust';

// 配置信息
export const ADJUST_CONFIG = {
  APP_TOKEN: 'jc3rbtx7qtc0',
};

// Adjust 事件类型
export const ADJUST_EVENTS = {
 
  TEST_EVENT: 'r9x1j9', // 测试事件
  REGISTER_EVENT: 'v1h639',
  DEPOSIT_EVENT: 'iwjpet',
};

class AdjustService {
  private isInitialized = false;

  /**
   * 初始化 Adjust SDK
   */
  initialize(isProduction: boolean = false) { // 增加一个参数来判断环境
    if (this.isInitialized) {
      return;
    }

    try {
      // 设置环境
      // const environment = isProduction 
      //   ? AdjustConfig.EnvironmentProduction 
      //   : AdjustConfig.EnvironmentSandbox;
      const environment = AdjustConfig.EnvironmentSandbox 

      const adjustConfig = new AdjustConfig(ADJUST_CONFIG.APP_TOKEN, environment);
      
      // 设置日志级别
      adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
      
      Adjust.initSdk(adjustConfig);  // 初始化 SDK

      this.isInitialized = true;
    } catch (error) {
      console.error('🚀 Failed to initialize Adjust SDK:', error);
    }
  }

  /**
   * 发送用户行为追踪事件
   * @param eventToken 事件 Token
   * @param options 
   */
  trackEvent(
    eventToken: string,
    options?: {
      revenue?: number;
      currency?: string;
      callbackParams?: Record<string, string>; // 回调参数 (用于发送给 Adjust 的后端服务器)
      partnerParams?: Record<string, string>; // 作伙伴参数 (用于转发给广告平台的回传)
  }
  ) {
    try {
      const adjustEvent = new AdjustEvent(eventToken);
      
      // 充提款金额参数处理
      if (options?.revenue !== undefined && options?.currency) {
        adjustEvent.setRevenue(options?.revenue, options?.currency);
      }
      
      if (options?.callbackParams) {
        Object.entries(options?.callbackParams).forEach(([key, value]) => {
          adjustEvent.addCallbackParameter(key, value);
        });
      }
      
      if (options?.partnerParams) {
        Object.entries(options?.partnerParams).forEach(([key, value]) => {
          adjustEvent.addPartnerParameter(key, value);
        });
      }
      
      Adjust.trackEvent(adjustEvent);
    } catch (error) {
      console.error(`Failed to track event ${eventToken}:`, error);
    }
  }

  /**
   * 设置用户 ID
   */
  setUserId(userId: string) {
    try {
      Adjust.setExternalDeviceIdInDelay(userId);
    } catch {
    }
  }

  /**
   * 设置推送令牌
   * @param pushToken 推送令牌
   */
  setPushToken(pushToken: string) {
    try {
      Adjust.setPushToken(pushToken);
    } catch {
    }
  }

  /**
   * 获取归因信息
   */
  getAttribution(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        Adjust.getAttribution((attribution: any) => {
          resolve(attribution);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取广告 ID
   */
  getAdid(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        Adjust.getAdid((adid: string) => {
          resolve(adid);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// 单例实例
export const adjustService = new AdjustService();

// 默认实例
export default adjustService;
