import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = process.env.CORAM_APP_VARIANT ?? 'development';
  const isProduction = appVariant === 'production';
  const googleTestAndroidAppId = 'ca-app-pub-3940256099942544~3347511713';
  const googleTestIosAppId = 'ca-app-pub-3940256099942544~1458002511';

  return {
    ...config,
    name: isProduction ? 'CorAM' : 'CorAM Dev',
    slug: 'coram-mobile',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'coram',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F8F3E7',
      },
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-web-browser',
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: process.env.ADMOB_ANDROID_APP_ID ?? googleTestAndroidAppId,
          iosAppId: process.env.ADMOB_IOS_APP_ID ?? googleTestIosAppId,
          userTrackingUsageDescription: 'Este identificador se usa para mostrar publicidad según tu consentimiento.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#F8F3E7',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      appVariant,
    },
  };
};
