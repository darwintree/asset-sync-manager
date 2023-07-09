import pLimit from "p-limit";
import fs from "fs-extra";
import path from "path";
import ProgressBar from "progress";
import {
  IPathController,
  IVersionController,
  IIntegrityChecker,
  Logger,
  AssetEntry,
  AssetIdFilter,
} from "../types/index.js";
import { constructDefaultLogger } from "../logger";
import { downloadAsset, shouldSyncAssetId } from "../utils.js";
import { AssetSyncManagerError } from "../errors";

export class SyncManager<T> {
  logger: Logger;
  localTmpDir?: string;

  constructor(
    private versionController: IVersionController<T>,
    private pathController: IPathController<T>,
    private integrityChecker?: IIntegrityChecker,
    options?: {
      logger?: Logger;
    }
  ) {
    this.logger =
      options?.logger || constructDefaultLogger("combined.log", "error.log");
  }

  createProgressBar(options: ProgressBar.ProgressBarOptions) {
    return new ProgressBar(
      "  downloading [:bar] :rate/bps :percent :etas\n",
      options
    );
  }

  async checkAssetIntegrity(assetId: string, localPath: string) {
    if (this.integrityChecker?.shouldCheckIntegrity(assetId)) {
      await this.integrityChecker.checkIntegrity(localPath);
    }
  }

  async updateLocalAsset(
    assetId: string,
    version: T,
    { retryCount = 3, removeLegacy = false }
  ) {
    let tmpPath = this.pathController.getTmpLocalPath(assetId, version);
    try {
      // download and check integrity
      const remotePath = this.pathController.getRemotePath(assetId, version);
      await downloadAsset(remotePath, tmpPath);
      try {
        await this.checkAssetIntegrity(assetId, tmpPath);
      } catch (err) {
        this.logger.error(`File integrity check failed for ${assetId}: ${err}`);
        await fs.remove(tmpPath);
        // do not retry if integrity check did not pass
        return;
      }

      // remove legacy version
      if (removeLegacy) {
        if (!this.versionController.getLocalVersion) {
          // should not trigger because of check in syncAll
          throw new AssetSyncManagerError(
            "unexpected parameter error: cannot remove legacy version because versionController.getLocalVersion not implemented"
          );
        }
        const legacyVersion = await this.versionController.getLocalVersion(
          assetId
        );
        if (legacyVersion !== null) {
          const legacyPath = this.pathController.getLocalPath(
            assetId,
            legacyVersion
          );
          if (!fs.existsSync(legacyPath)) {
            this.logger.warn(
              `Not found legacy asset ${assetId}(version ${legacyVersion}) at ${legacyPath}`
            );
          } else {
            await fs.remove(legacyPath);
          }
        }
      }

      // move from tmp path to final path
      const finalPath = this.pathController.getLocalPath(assetId, version);
      await fs.ensureDir(path.dirname(finalPath));
      await fs.move(tmpPath, finalPath, { overwrite: true });

      await this.versionController.upsertLocalVersion(assetId, version);
    } catch (error) {
      if (retryCount <= 0) {
        this.logger.error(`Failed to download ${assetId}`);
        return;
      }
      this.logger.warn(
        `Retrying download of ${assetId}, remaining attempts: ${retryCount - 1}`
      );
      await this.updateLocalAsset(assetId, version, {
        retryCount: retryCount - 1,
        removeLegacy,
      });
    }
  }

  async syncAll(
    assetEntry: AssetEntry<T>,
    options: {
      concurrency: number;
      removeLegacy: boolean;
      assetIdFilters?: {
        assetIdIncludeFilters?: AssetIdFilter[];
        assetIdExcludeFilters?: AssetIdFilter[];
      };
    } = { concurrency: 16, removeLegacy: false }
  ) {
    if (options.removeLegacy && !this.versionController.getLocalVersion) {
      throw new AssetSyncManagerError(
        "unexpected parameter error: cannot remove legacy version because versionController.getLocalVersion not implemented"
      );
    }
    let total = 0;
    // iterate and get total count
    for (const assetId in assetEntry) {
      if (!shouldSyncAssetId(assetId, options.assetIdFilters)) continue;
      if (
        await this.versionController.shouldSync(assetId, assetEntry[assetId])
      ) {
        total += 1;
      }
    }
    this.logger.info(`total: ${total}`);
    const progressBar = this.createProgressBar({
      total,
    });

    const syncPromises = [];
    const limit = pLimit(options.concurrency);
    // iterate and sync
    for (const assetId in assetEntry) {
      if (!shouldSyncAssetId(assetId, options.assetIdFilters)) continue;
      if (
        !(await this.versionController.shouldSync(assetId, assetEntry[assetId]))
      )
        continue;
      const remoteVersion = assetEntry[assetId];
      syncPromises.push(
        limit(async () => {
          try {
            await this.updateLocalAsset(assetId, remoteVersion, {
              removeLegacy: options.removeLegacy,
            });
          } finally {
            progressBar.tick();
          }
        })
      );
    }
    await Promise.all(syncPromises);
  }
}
