const { withGradleProperties } = require('@expo/config-plugins');

function upsertProperty(modResults, key, value) {
  const idx = modResults.findIndex((p) => p.type === 'property' && p.key === key);
  if (idx >= 0) {
    modResults[idx].value = value;
  } else {
    modResults.push({ type: 'property', key, value });
  }
}

/**
 * Prebuild 时写入 android/gradle.properties，与 RN/Fresco 动图依赖一致（避免 clean prebuild 丢改）。
 * 注意：expo-build-properties 未暴露 expo.webp.*，需用 withGradleProperties 自建插件。
 */
module.exports = function withAndroidExpoWebp(config) {
  return withGradleProperties(config, (config) => {
    upsertProperty(config.modResults, 'expo.gif.enabled', 'true');
    upsertProperty(config.modResults, 'expo.webp.enabled', 'true');
    upsertProperty(config.modResults, 'expo.webp.animated', 'true');
    return config;
  });
};
