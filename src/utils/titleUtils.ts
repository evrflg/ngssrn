/**
 * 处理标题截断逻辑
 * 如果标题超过15个字符，则截断并显示省略号
 * @param title 原始标题
 * @param actDetailTitle 活动详情标题
 * @returns 处理后的标题
 */
export const processTitle = (title: string): string => {
  const targetLength = 14;
  
  if (title.length > targetLength) {
    return title.substring(0, targetLength) + '...';
  }
  
  return title;
}; 