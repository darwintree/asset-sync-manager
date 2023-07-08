import { Collection, MongoClient } from "mongodb";
import { IVersionController } from "../../types.ts/version-controller";
import { VersionControllerNotInit } from "../../errors";

class MongodbVersionController implements IVersionController<number> {
  uri: string;
  dbName: string;
  collectionName: string;
  assetIdFieldName: string;
  versionFieldName: string;
  collection: Collection | null = null;

  constructor(options: {
    uri: string;
    dbName: string;
    collectionName: string;
    assetIdFieldName?: string;
    versionFieldName?: string;
  }) {
    this.uri = options.uri;
    this.dbName = options.dbName;
    this.collectionName = options.collectionName;
    this.assetIdFieldName = options.assetIdFieldName || "_id";
    this.versionFieldName = options.versionFieldName || "version";
  }

  async createIndex() {
    if (this.collection === null) throw new VersionControllerNotInit();

    await this.collection.createIndex(
      { [this.assetIdFieldName]: -1 },
      { unique: true }
    );
  }

  async init() {
    const client = new MongoClient(this.uri);
    this.collection = client.db(this.dbName).collection(this.collectionName);
    await this.createIndex();
  }

  async getLocalVersion(assetId: string): Promise<number | null> {
    if (this.collection === null) throw new VersionControllerNotInit();
    const doc = await this.collection.findOne(this.assetIdFilter(assetId));
    if (!doc) return null;
    return doc[this.versionFieldName] as number;
  }

  isRemoteVersionNewer(remoteVersion: number, localVersion: number): boolean {
    return remoteVersion > localVersion;
  }

  async shouldSync(assetId: string, remoteVersion: number): Promise<boolean> {
    if (this.collection === null) throw new VersionControllerNotInit();
    const localVersion = await this.getLocalVersion(assetId);
    if (localVersion === null) return true;
    return this.isRemoteVersionNewer(remoteVersion, localVersion);
  }

  async upsertLocalVersion(assetId: string, newVersion: number): Promise<void> {
    if (this.collection === null) throw new VersionControllerNotInit();
    await this.collection.updateOne(
      this.assetIdFilter(assetId),
      { $set: { [this.versionFieldName]: newVersion } },
      { upsert: true }
    );
  }

  assetIdFilter(assetId: string) {
    return {
      [this.assetIdFieldName]: assetId,
    };
  }
}

export { MongodbVersionController };
