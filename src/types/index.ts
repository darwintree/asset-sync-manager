import { IPathController } from "./path-controller";
import { IVersionController } from "./version-controller";
import { IIntegrityChecker } from "./integrity-checker";
import { Logger } from "./logger";

export type AssetIdFilter = (assetId: string) => boolean;

export interface AssetEntry<T> {
  [assetId: string]: T;
}

export { IPathController, IVersionController, IIntegrityChecker, Logger };

