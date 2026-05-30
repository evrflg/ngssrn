/**
* 消息占位符解析工具
*/

/**
 * 检测消息是否包含占位符
 * @param message 要检测的消息
 * @returns 是否包含占位符
 */
export function hasPlaceholders(message: string): boolean {
  return /\{[^}]*\}/.test(message)
}

/**
 * 提取消息中所有占位符的值
 * @param message 包含占位符的消息
 * @returns 占位符值数组
 */
export function extractPlaceholderValues(message: string): string[] {
  const matches = message.match(/\{([^}]*)\}/g)
  if (!matches) return []

  return matches.map(match => match.slice(1, -1)) // 去掉花括号
}

/**
 * 将占位符替换为标准的i18n格式
 * @param message 包含自定义占位符的消息
 * @returns 转换为标准格式的消息和参数值
 */
export function convertToI18nFormat(message: string): {
  template: string    // 转换后的模板
  values: string[]   // 参数值数组
} {
  const values = extractPlaceholderValues(message)
  let template = message

  // 将 {value} 按顺序替换每个占位符 {0}, {1}, {2}...
  values.forEach((value, index) => {
    // 将具体的占位符 {value} 替换为 {index}
    template = template.replace(`{${value}}`, `{${index}}`)
  })

  return {
    template,
    values
  }
}

/**
 * 处理错误消息中的占位符
 * @param message 原始错误消息
 * @returns 处理后的消息信息
 */
export function processErrorMessage(message: string): {
  hasPlaceholders: boolean // 是否包含占位符
  originalMessage: string // 原始消息
  template?: string // 转换后的模板
  values?: string[] // 参数值数组
} {
  const hasPlaceholder = hasPlaceholders(message)

  if (!hasPlaceholder) {
    return {
      hasPlaceholders: false,
      originalMessage: message
    }
  }

  const { template, values } = convertToI18nFormat(message)

  return {
    hasPlaceholders: true,
    originalMessage: message,
    template,
    values
  }
}

/**
 * 提取错误码和错误消息
 * @param message 错误消息
 * @returns 错误码和错误消息
 */
export function ExtractErrorCode(message: string) {
  if (message?.includes('errorCode') && message?.includes('}')) {
    const msg = message.split('errorCode=')[1].split('}')
    const errorCode = msg[0]
    const errorMessage = msg[1]
    return { errorCode, errorMessage }
  }
  return null
}