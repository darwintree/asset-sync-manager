// src/types/path-controller.ts
export type GetPath<T> = (assetId: string, version: T) => string;
export type ResolvePath<T> = (path: string) => {
  assetId: string;
  version: T;
};
export interface IPathController<T> {
  getRemotePath: GetPath<T>;
  getLocalPath: GetPath<T>;
  getTmpLocalPath: GetPath<T>;
  resolveRemotePath?: ResolvePath<T>; // no use now
  resolveLocalPath?: ResolvePath<T>; // no use now
}
