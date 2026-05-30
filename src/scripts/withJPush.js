const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * JPush 配置插件
 * 确保 Android 权限和配置正确
 */
module.exports = function withJPush(config) {
  // 添加 Android 权限
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    
    // 确保 permissions 数组存在
    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }

    const permissions = manifest.manifest['uses-permission'];
    
    // JPush 需要的权限列表
    const requiredPermissions = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_USER_PRESENT',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ];

    // 检查并添加缺失的权限
    requiredPermissions.forEach((permission) => {
      const exists = permissions.some(
        (p) => p.$['android:name'] === permission
      );
      
      if (!exists) {
        permissions.push({
          $: { 'android:name': permission },
        });
      }
    });

    return config;
  });

  return config;
};

