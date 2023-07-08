import path from "path";
import { GetRemotePath, GetLocalPath } from "../types/path-controller";

function constructDefaultGetRemotePath<T>(baseUrl: string): GetRemotePath<T> {
  if (!baseUrl.endsWith("/")) {
    baseUrl += "/";
  }
  return (assetId: string, version: T) => `${baseUrl}${assetId}`;
}

function constructDefaultGetLocalPath<T>(assetDir: string): GetLocalPath<T> {
  return (assetId: string, version: T) => {
    return path.join(assetDir, assetId);
  };
}

function constructDefaultVersionedGetLocalPath<T>(
  assetDir: string
): GetLocalPath<T> {
  return (assetId: string, version: T) => {
    // 提取文件名和扩展名
    const ext = path.extname(assetId);
    const name = path.basename(assetId, ext);

    // 生成新的文件名，将版本添加到原来的文件名后面
    const newName = `${name}.${version}${ext}`;

    // 返回新路径
    return path.join(assetDir, path.dirname(assetId), newName);
  };
}


export {
  constructDefaultGetLocalPath,
  constructDefaultGetRemotePath,
  constructDefaultVersionedGetLocalPath,
};
