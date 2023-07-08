// src/types/path-controller.ts
export type GetRemotePath<T> = (assetId: string, version: T) => string;
export type GetLocalPath<T> = (assetId: string, version: T) => string;
export type ResolveRemotePath<T> = (path: string) => {
  assetId: string;
  version: T;
};
export type ResolveLocalPath<T> = (path: string) => {
  assetId: string;
  version: T;
};

export interface IPathController<T> {
  getRemotePath: GetRemotePath<T>;
  getLocalPath: GetLocalPath<T>;
  getTmpLocalPath: GetLocalPath<T>;
  resolveRemotePath?: ResolveRemotePath<T>;
  resolveLocalPath?: ResolveLocalPath<T>;
}
