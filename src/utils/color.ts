
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  // 处理 3 位和 6 位 hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * @description: 颜色加亮度（用于渐变背景色）
 * @return {*} string
 */
export function colorMix (
  baseColor: string, 
  mixColor: string = '#FFFFFF', 
  basePercent: number = 70,
  mixPercent: number = 30
): string {
  const baseRgb = hexToRgb(baseColor);
  const mixRgb = hexToRgb(mixColor);
  
  const r = (baseRgb.r * basePercent + mixRgb.r * mixPercent) / 100;
  const g = (baseRgb.g * basePercent + mixRgb.g * mixPercent) / 100;
  const b = (baseRgb.b * basePercent + mixRgb.b * mixPercent) / 100;
  
  return rgbToHex(r, g, b);
};