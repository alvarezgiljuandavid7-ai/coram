import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coram.app',
  appName: 'CorAM',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0B2545',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
