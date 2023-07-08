import path from "path";
import { GetRemotePath, GetLocalPath } from "../../types.ts/path-controller";


function constructDefaultGetRemotePath<T>(baseUrl: string): GetRemotePath<T> {
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  return (assetId: string, version: T) => `${baseUrl}${assetId}`
}

function constructDefaultGetLocalPath<T>(assetDir: string): GetLocalPath<T> {
  return (assetId: string, version: T) => {
    return path.join(assetDir, assetId);
  };
}

export {
  constructDefaultGetLocalPath,
  constructDefaultGetRemotePath
}
