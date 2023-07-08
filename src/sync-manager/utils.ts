import fs from 'fs-extra'
import path from 'path'
import axios from "axios"
import { DownloadError } from '../errors'
import { AssetIdFilter } from '../types.ts'

async function downloadAsset(remotePath: string, localPath: string, downloadOptions: {
  connectTimeout?: number,
  downloadTimeout?: number,
} = {}) {

  const connectTimeout = downloadOptions.connectTimeout || 5000
  const downloadTimeout = downloadOptions.downloadTimeout || 20000


  const response = await axios.get(remotePath, {
    responseType: "stream",
    timeout: connectTimeout,
  });
  await fs.ensureDir(path.dirname(localPath));
  const writer = fs.createWriteStream(localPath);
  response.data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      writer.close();
      reject(new DownloadError(`Download timed out after ${downloadTimeout/1000} seconds`));
    }, downloadTimeout); // 20 seconds timeout for download

    writer.on("finish", () => {
      clearTimeout(timeoutId);
      resolve();
    });

    writer.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(new DownloadError(undefined, error));
    });
  });
}

function shouldSyncAssetId(
  assetId: string,
  {
    assetIdIncludeFilters,
    assetIdExcludeFilters,
  }: {
    assetIdIncludeFilters?: AssetIdFilter[];
    assetIdExcludeFilters?: AssetIdFilter[];
  } = {}
): boolean {
  // exclude filter only filters out those should not be included
  if (assetIdExcludeFilters) {
    if (assetIdExcludeFilters.some((filter) => filter(assetId))) {
      return false
    }
  }
  if (assetIdIncludeFilters) {
    if (assetIdIncludeFilters.some((filter) => filter(assetId))) {
      return true
    }
    return false
  }
  return true
}

export { downloadAsset, shouldSyncAssetId };
