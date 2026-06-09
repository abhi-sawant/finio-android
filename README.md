# Finio — Android (React Native / Expo)

A native Android port of the **Finio** personal finance / expense-tracker PWA. Same business logic and same backend; offline-first with optional cloud sync.

## Stack

- **Expo SDK 56** · React Native 0.85 · React 19 · expo-router (file-based routing)
- **NativeWind v4** (Tailwind for RN) for styling — design tokens mirror the PWA in `tailwind.config.js` + `src/global.css`
- **Zustand** (+ AsyncStorage persistence) — `src/store/`
- **victory-native** (Skia) for charts — `src/components/charts/`
- **date-fns**, **lucide-react-native**, **@formatjs** Intl polyfills (currency formatting)
- Backend: unchanged PHP + MySQL REST API (email/OTP → JWT, daily JSON backup)

## Setup

```bash
npm install
cp .env.example .env   # optional — defaults to the production API URL
```

Set `EXPO_PUBLIC_API_URL` in `.env` if your backend is hosted elsewhere.

## Running

Charts use `@shopify/react-native-skia`, which is **not supported in Expo Go** — you need a development build:

```bash
npx expo run:android        # builds & installs a dev client (requires Android SDK + Java 17+)
# or with EAS:
# eas build --profile development --platform android
```

Then `npx expo start --dev-client`.

## Checks

```bash
npx tsc --noEmit                     # type-check
npx expo lint                        # lint
npx expo export --platform android   # validate the production bundle
```

## Structure

```
src/
  app/                 # expo-router routes
    (tabs)/            # Dashboard, Accounts, Transactions, Analytics, Settings
    (auth)/            # login, register, verify-otp, forgot/reset-password
    add|edit-*.tsx     # modal forms (transaction, account), manage-*, budgets, recurring
  components/          # accounts, transactions, charts, categories, layout, ui
  store/               # useFinanceStore, useAuthStore (Zustand + AsyncStorage)
  services/            # api.ts (REST client), backup.ts (cloud + local file backup)
  utils/               # calculations.ts, formatters.ts  (ported verbatim from the PWA)
  data/                # defaultData.ts (24 categories, 9 labels)
  lib/, hooks/, constants/, types/
```
