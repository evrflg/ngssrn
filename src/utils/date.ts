import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'

export type Option = typeof OPTIONS[number]

export const OPTIONS = ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'custom'] as const

/**
 * 取某个时刻在指定时区内所在那天的 00:00:00，返回对应的 UTC Date。
 * 未传 timezone 时退化为设备本地时区（保持旧行为）。
 */
function startOfDay(date: Date, timezone?: string): Date {
  if (timezone) {
    const zoned = toZonedTime(date, timezone);
    zoned.setHours(0, 0, 0, 0);
    return fromZonedTime(zoned, timezone);
  }
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 取某个时刻在指定时区内所在那天的 23:59:59.999，返回对应的 UTC Date。
 * 未传 timezone 时退化为设备本地时区（保持旧行为）。
 */
function endOfDay(date: Date, timezone?: string): Date {
  if (timezone) {
    const zoned = toZonedTime(date, timezone);
    zoned.setHours(23, 59, 59, 999);
    return fromZonedTime(zoned, timezone);
  }
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * @description: 格式化时间
 * @param {Date} date 事件对象
 * @return {*} 格式化输出的时间
 */
export function formatDate(date: Date, timezone = 'UTC'): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm:ss')
}

/**
 * @description: 获取时间段
 * @param {string} range 关键字
 * @param {string} timezone 服务器时区（IANA 格式，如 "Asia/Shanghai"），
 *   传入后所有边界均以该时区计算，避免设备时区与服务器时区不一致导致偏移
 * @return {{startTime: Date, endTime: Date}}
 */
export function getDateRange(range: Option, timezone?: string) {
  // 若传了 timezone，先取"当前时刻在该时区里是几月几日"作为计算基准
  const now = timezone ? toZonedTime(new Date(), timezone) : new Date();
  switch (range) {
    case 'today': {
      return {
        startTime: startOfDay(now, timezone),
        endTime: endOfDay(now, timezone),
      };
    }
    case 'yesterday': {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startTime: startOfDay(yesterday, timezone),
        endTime: endOfDay(yesterday, timezone),
      };
    }
    case 'this_week': {
      const nowDay = now.getDay() || 7; // 将周日(0)转换为7
      const monday = new Date(now);
      monday.setDate(now.getDate() - nowDay + 1);
      return {
        startTime: startOfDay(monday, timezone),
        endTime: endOfDay(now, timezone),
      };
    }
    case 'last_week': {
      const nowDay = now.getDay() || 7;
      const lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - nowDay - 6);
      const lastSunday = new Date(now);
      lastSunday.setDate(now.getDate() - nowDay);
      return {
        startTime: startOfDay(lastMonday, timezone),
        endTime: endOfDay(lastSunday, timezone),
      };
    }
    case 'this_month': {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startTime: startOfDay(firstDayOfMonth, timezone),
        endTime: endOfDay(now, timezone),
      };
    }
    case 'last_month': {
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startTime: startOfDay(firstDayOfLastMonth, timezone),
        endTime: endOfDay(lastDayOfLastMonth, timezone),
      };
    }
    default: {
      // 默认当天（兜底）
      return {
        startTime: startOfDay(now, timezone),
        endTime: endOfDay(now, timezone),
      };
    }
  }
}

const addYellow = (n: number) => n.toString().padStart(2, '0')

/**
 * @description: 格式化时间
 * @param {Date | number} date 时间对象或时间戳
 * @param {string} separator 分隔符，默认为斜杠（/）
 * @return {*} {string} 格式化后的时间字符串
 * @example: formatDateTime(new Date()) // 2025-04-09
 */
export function formatDateTime(date: Date | number, separator: string = '-'): string {
  if (!date) return '-'
  if (typeof date === 'number') {
    date = new Date (date)
  }
  const year = date.getFullYear()
  const month = addYellow(date.getMonth() + 1)
  const day = addYellow(date.getDate())
  return year + separator + month + separator + day
}

export const formaDateFromArray = (timeArr: number[]): string => timeArr.join('-')

export const MAX_DATE = new Date(8640000000000000)