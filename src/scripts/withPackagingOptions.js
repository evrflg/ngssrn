const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * 解决 react-native-reanimated 和 react-native-worklets 同时提供 libworklets.so 的冲突
 */
module.exports = function withPackagingOptions(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    const pickFirstBlock = `
            // react-native-reanimated 和 react-native-worklets 均提供 libworklets.so，取第一个避免冲突
            pickFirsts += [
                'lib/armeabi-v7a/libworklets.so',
                'lib/arm64-v8a/libworklets.so',
                'lib/x86/libworklets.so',
                'lib/x86_64/libworklets.so',
            ]`;

    if (!buildGradle.includes('libworklets.so')) {
      config.modResults.contents = buildGradle.replace(
        /packagingOptions\s*\{(\s*jniLibs\s*\{)/,
        `packagingOptions {$1${pickFirstBlock}`
      );
    }

    return config;
  });
};
