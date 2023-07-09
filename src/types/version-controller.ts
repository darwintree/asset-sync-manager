export interface IVersionController<T> {
  init(): Promise<void>;
  shouldSync(assetId: string, remoteVersion: T): Promise<boolean>;
  upsertLocalVersion(assetId: string, version: T): Promise<void>;
  getLocalVersion?(assetId: string): Promise<T | null>; // should support if want to remove legacy
  isRemoteVersionNewer?(remoteVersion: T, localVersion: T): boolean;
}
