export interface IIntegrityChecker {
  shouldCheckIntegrity: (assetId: string) => boolean;
  checkIntegrity: (localPath: string) => Promise<void>; // throw an error if not integrity
}
