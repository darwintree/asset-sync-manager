import { IPathController } from "../types.ts/path-controller";
import { IVersionController } from "../types.ts/version-controller";
import { IIntegrityChecker } from "../types.ts/integrity-checker";
import { Logger } from "./logger";

export type AssetIdFilter = (assetId: string) => boolean;

export interface AssetEntry<T> {
  [assetId: string]: T;
}

export { IPathController, IVersionController, IIntegrityChecker, Logger };

