import type { ConfigContext, ExpoConfig } from 'expo/config';

type Sdk57ExpoConfig = ExpoConfig & {
  android?: NonNullable<ExpoConfig['android']> & {
    edgeToEdgeEnabled?: boolean;
  };
  newArchEnabled?: boolean;
  splash?: {
    image?: string;
    resizeMode?: 'contain' | 'cover' | 'native';
    backgroundColor?: string;
  };
};

export default ({ config }: ConfigContext): Sdk57ExpoConfig => {
  const appVariant = process.env.CORAM_APP_VARIANT ?? 'development';
  const isProduction = appVariant === 'production';

  return {
    ...config,
    name: isProduction ? 'CorAM' : 'CorAM Dev',
    slug: 'coram-mobile',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'coram',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#F8F3E7',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#F8F3E7',
      },
      edgeToEdgeEnabled: true,
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      appVariant,
    },
  };
};
