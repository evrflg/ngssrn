export type TargetType = 'activity' | 'unlock';

export interface ParsedContent {
  content: string;
  type?: TargetType;
  id?: string;
  nickName?: string;
}
const CODE_PATTERN = /\[(activity|unlock)-code:(\d+)\]/;
const NICK_PATTERN = /\[nick-name:([^\]]+)\]/;

/**
 * @description: 解析消息内容（截取 ID，发送人姓名）
 * @param {string} entry
 * @return {ParsedContent}
 */
export function parseContent(entry: string): ParsedContent {
  let content = entry;
  let type: TargetType | undefined;
  let id: string | undefined;
  let nickName: string | undefined;
  
  // 提取并移除活动/彩金 ID
  const codeMatch = entry.match(CODE_PATTERN);
  if (codeMatch) {
    type = codeMatch[1] as TargetType | undefined;
    id = codeMatch[2];
    content = content.replace(codeMatch[0], '');
  }
  
  // 提取并移除发送人姓名
  const nickMatch = content.match(NICK_PATTERN);
  if (nickMatch) {
    nickName = nickMatch[1];
    content = content.replace(nickMatch[0], '');
  }
  
  content = content.trim();
  
  return {
    content,
    type,
    id,
    nickName
  };
}
// ex: Lorem ipsum dolor sit amet consectetur adipisicing elit.\n[activity-code:2043326628961030145][nick-name:system]