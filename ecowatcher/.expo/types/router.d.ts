/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/PickUp` | `/(tabs)/TongSampah` | `/(tabs)/catalog` | `/(tabs)/context/SelectedItemsContext` | `/(tabs)/dashboard` | `/(tabs)/edukasisampah` | `/(tabs)/explore` | `/(tabs)/penyetoran` | `/(tabs)/profile` | `/(tabs)/riwayat` | `/CatalogItem` | `/PickUp` | `/TongSampah` | `/_sitemap` | `/auth/login` | `/auth/register` | `/catalog` | `/config` | `/context/SelectedItemsContext` | `/dashboard` | `/edukasisampah` | `/explore` | `/navigation/AppNavigator` | `/penyetoran` | `/profile` | `/riwayat` | `/screens/AddAddressScreen` | `/screens/CatalogScreen` | `/screens/DashboardScreen` | `/screens/DetailKurirScreen` | `/screens/DibatalkanScreen` | `/screens/DijemputScreen` | `/screens/DitimbangScreen` | `/screens/DropPointScreen` | `/screens/KurirScreen` | `/screens/PenyetoranScreen` | `/screens/PickUpScreen` | `/screens/ProfileScreen` | `/screens/RincianScreen` | `/screens/RiwayatScreen` | `/screens/SelesaiScreen` | `/screens/TongSampahScreen` | `/screens/TrackScreen` | `/screens/TukarPointScreen` | `/screens\EditProfileScreen` | `/screens\SecurityScreen` | `/types`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
