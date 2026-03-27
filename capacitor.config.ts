import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.watchscout',
  appName: 'WatchScout',
  // Points at the live Vercel deployment — the Android WebView loads the full
  // Next.js app from the server (no static export needed).
  server: {
    url: 'https://watchscout.vercel.app',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: 'watchscout-release.keystore',
      keystoreAlias: 'watchscout',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#09090b', // zinc-950
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
}

export default config
