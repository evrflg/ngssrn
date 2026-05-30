/**
 * 合并多个参数字符串
 * @param paramStrings 参数字符串数组
 * @returns 合并后的参数字符串
 * @example
 * mergeParamStrings('a=1&b=2', 'c=3', 'a=4')
 * // 'a=4&b=2&c=3' (后面的会覆盖前面的)
 */
export const mergeParamStrings = (...paramStrings: string[]): string => {
  const params = new URLSearchParams()

  paramStrings.forEach((str) => {
    if (!str) return
    const urlParams = new URLSearchParams(str)
    urlParams.forEach((value, key) => {
      params.set(key, value)
    })
  })

  return params.toString()
}

/**
 * 从 sessionStorage 获取缓存的 URL 参数
 * @param key sessionStorage 的键名，默认为 'allParams'
 * @returns URL 参数字符串
 * @example
 * getCachedParams() // 'a=1&b=2'
 * getCachedParams('myParams') // 'x=1&y=2'
 */
export const getCachedParams = (key = 'allParams'): string => {
  const allParams = sessionStorage.getItem(key)
  if (!allParams) return ''

  try {
    const params = JSON.parse(allParams)
    return new URLSearchParams(params).toString()
  } catch (error) {
    console.error('解析参数失败:', error)
    return ''
  }
}