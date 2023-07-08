// src/types/path-controller.ts
export type GetRemotePath = (assetId: string, version: number) => string;
export type GetLocalPath = (assetId: string, version: number) => string;
export type GetAssetIdAndVersionFromRemotePath = (path: string) => {
  assetId: string;
  version: number;
};
export type GetAssetIdAndVersionFromLocalPath = (path: string) => {
  assetId: string;
  version: number;
};

export interface IPathController {
  getRemotePath: GetRemotePath;
  getLocalPath: GetLocalPath;
  getAssetIdAndVersionFromRemotePath?: GetAssetIdAndVersionFromRemotePath;
  getAssetIdAndVersionFromLocalPath?: GetAssetIdAndVersionFromLocalPath;
}
