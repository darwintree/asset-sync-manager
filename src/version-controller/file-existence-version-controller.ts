import fs from "fs-extra";
import { IVersionController } from "../types/version-controller";
import { GetPath } from "../types/path-controller";

// sync if file does not exist else not
export class FileExistenceVersionController implements IVersionController<number> {
  constructor(public getLocalPath: GetPath<number>) { };
  async init(): Promise<void> {}
  async shouldSync(assetId: string, remoteVersion: number): Promise<boolean> {
    if (await fs.exists(this.getLocalPath(assetId, remoteVersion))) {
      return false
    }
    return true;
  }
  async upsertLocalVersion(assetId: string, version: number): Promise<void> {}
}
