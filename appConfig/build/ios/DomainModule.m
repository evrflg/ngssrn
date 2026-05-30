#import <React/RCTBridgeModule.h>

// 在.m文件中声明接口
@interface DomainModule : NSObject <RCTBridgeModule>
@end

// 实现部分
@implementation DomainModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;  // 在主线程初始化
}

// 直接导出常量，而不是使用方法
- (NSDictionary *)constantsToExport
{
  // 从Info.plist中读取domain_url
  NSString *domainUrl = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"domain_url"];
  
  // 打印日志到控制台
  NSLog(@"[DomainModule] 导出域名: %@", domainUrl);
  
  // 返回常量字典
  return @{
    @"domain_url": domainUrl
  };
}

@end
