// src/types/path-controller.ts
export type GetRemoteRelPath<T> = (assetId: string, version: T) => string;
export type GetLocalRelPath<T> = (assetId: string, version: T) => string;
export type ResolveRemoteRelPath<T> = (path: string) => {
  assetId: string;
  version: T;
};
export type ResolveLocalRelPath<T> = (path: string) => {
  assetId: string;
  version: T;
};

export interface IPathController<T> {
  getRemotePath: GetRemoteRelPath<T>;
  getLocalPath: GetLocalRelPath<T>;
  resolveRemoteRelPath?: ResolveRemoteRelPath<T>;
  resolveLocalRelPath?: ResolveLocalRelPath<T>;
}
