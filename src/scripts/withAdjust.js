const { withAppBuildGradle, withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAdjust(config) {
  // 处理 build.gradle
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes("com.adjust.sdk:adjust-android")) {
      config.modResults.contents = buildGradle.replace(
        /dependencies\s?{/,
        `dependencies {
    implementation 'com.google.android.gms:play-services-ads-identifier:18.1.0'
    implementation 'com.android.installreferrer:installreferrer:2.2'
    implementation 'com.adjust.sdk:adjust-android-webbridge:5.4.4'
    implementation 'com.adjust.sdk:adjust-android-huawei-referrer:5.0.0'
    implementation 'com.adjust.sdk:adjust-android:5.4.4'`
      );
    }

    return config;
  });

  // 处理 AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // 找到 MainActivity
    const mainActivity = manifest.manifest.application[0].activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (!mainActivity) return config;

    // 确保 intent-filter 数组存在
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // 检查是否已添加 autoVerify
    const hasAutoVerify = mainActivity['intent-filter'].some(
      (intent) => intent.$ && intent.$['android:autoVerify'] === 'true'
    );

    if (!hasAutoVerify) {
      const intentFilter = {
        $: { 'android:autoVerify': 'true' },
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [
          { $: { 'android:scheme': 'http', 'android:host': 'ngss-app.go.link' } },
          { $: { 'android:scheme': 'https', 'android:host': 'ngss-app.go.link' } },
        ],
      };

      mainActivity['intent-filter'].push(intentFilter);
    }

    return config;
  });

  return config;
};