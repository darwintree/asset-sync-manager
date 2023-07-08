import path from "path";
import { GetRemoteRelPath, GetLocalRelPath } from "../../types.ts/path-controller";


function constructDefaultGetRemotePath<T>(): GetRemoteRelPath<T> {
  return (assetId: string, version: T) => assetId
}

function constructDefaultGetLocalRelPath<T>(assetsRelDir: string): GetLocalRelPath<T> {
  return (assetId: string, version: T) => {
    return path.join(assetsRelDir, assetId);
  };
}

export {
  constructDefaultGetLocalRelPath,
  constructDefaultGetRemotePath
}
