const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = ({ config }) => {
  return withAndroidStyles(config, async (config) => {
    const styles = config.modResults;
    if (styles.resources && styles.resources.style) {
      const splashScreenStyle = styles.resources.style.find(
        (style) => style.$ && style.$.name === 'Theme.App.SplashScreen'
      );
      if (splashScreenStyle && splashScreenStyle.item) {
        const windowBackgroundItem = splashScreenStyle.item.find(
          (item) => item.$ && item.$.name === 'android:windowBackground'
        );
        if (windowBackgroundItem && windowBackgroundItem._ === '@drawable/splashscreen_logo') {
          // Use the generated layered background instead of the raw image to prevent tiling (grid/circles effect)
          windowBackgroundItem._ = '@drawable/ic_launcher_background';
        }
      }
    }
    return config;
  });
};
