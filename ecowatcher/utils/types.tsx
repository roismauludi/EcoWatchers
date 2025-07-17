import { CatalogItem } from "./CatalogItem";

export type TabParamList = {
  Home: undefined;
  Tong: undefined;
  Riwayat: { userId: string };
  Profile: undefined;
  Admin: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  KurirDashboard: undefined;
  Detail: { queueNumber: string };
  Catalog: undefined;
  CampaignDetail: { campaign: any };
  AllCampaign: undefined;
  Penyetoran: { items: CatalogItem[] };
  PickUp: undefined;
  Rincian: { id: string; pickupId?: string };
  Dibatalkan: undefined;
  Dijemput: undefined;
  Track: { pickupId: string };
  TukarPoint: undefined;
  Riwayat: { userId: string };
  Tong: undefined;
  EditProfile: undefined;
  Security: undefined;
  AddAddress: { editAddress?: any } | undefined;
  DropPoint: undefined;
  Education: undefined;
  Ditimbang: undefined;
  Selesai: undefined;
  AdminDashboard: undefined;
  DaftarAlamat: undefined;
  Channels: undefined;
};
