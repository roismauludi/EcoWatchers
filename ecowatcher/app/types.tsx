import { CatalogItem } from "./CatalogItem";
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  dashboard: undefined;
  MainTabs: undefined;
  KurirDashboard: undefined;
  Detail: undefined;
  Catalog: undefined;
  Penyetoran: { items: CatalogItem[] };
  PickUp: undefined;
  Rincian: { id: string; pickupId?: string };
  Dibatalkan: undefined;
  Dijemput: undefined;
  Track: { pickupId: string };
  TukarPoint: undefined;
  Riwayat: { userId: string };
  Tong: undefined; // Define the 'Tong' route here
  EditProfile: undefined;
  Security: undefined;
};
