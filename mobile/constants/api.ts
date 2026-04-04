// Set EXPO_PUBLIC_API_URL in mobile/.env.local for local dev.
// For Expo Go on a physical device, use your machine's LAN IP: http://192.168.x.x:3000
// or run `expo start --tunnel` and use the tunnel URL.
// For production, point to your Vercel deployment.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://YOUR_VERCEL_URL.vercel.app';
