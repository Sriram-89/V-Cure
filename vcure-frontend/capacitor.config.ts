/**
 * V-Cure Capacitor Production Configuration
 * 
 * Architecture:
 * Android APK Wrapper -> V-Cure Nutrition Web Frontend (server.url: http://192.168.31.254:3000)
 *                      -> Render NestJS API (NEXT_PUBLIC_API_BASE_URL: https://vcure-backend.onrender.com/api/v1)
 *                      -> Supabase PostgreSQL + Storage
 */

const config = {
  appId: 'com.vcure.app',
  appName: 'V-Cure',
  webDir: 'out',
  server: {
    url: 'http://192.168.31.254:3000',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#047857',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#047857'
    }
  }
};

export default config;


