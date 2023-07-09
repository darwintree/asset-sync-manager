import { IVersionController } from "../types/version-controller";

export class AlwaysUpdateVersionController implements IVersionController<number> {
  async init(): Promise<void> {}
  async shouldSync(assetId: string, remoteVersion: number): Promise<boolean> {
    return true
  }
  async upsertLocalVersion(assetId: string, version: number): Promise<void> {}
  async getLocalVersion(assetId: string): Promise<number | null> {
    return null
  }
}
