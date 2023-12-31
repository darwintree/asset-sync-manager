import { Collection, MongoClient } from "mongodb";
import { IVersionController } from "../types/version-controller";
import { VersionControllerNotInit } from "../errors";

class MongodbVersionController implements IVersionController<number> {
  uri: string;
  dbName: string;
  collectionName: string;
  assetIdFieldName: string;
  versionFieldName: string;
  collection: Collection | null = null;

  constructor({
    uri,
    dbName,
    collectionName,
    assetIdFieldName,
    versionFieldName,
  }: {
    uri: string;
    dbName: string;
    collectionName: string;
    assetIdFieldName?: string;
    versionFieldName?: string;
  }) {
    this.uri = uri;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.assetIdFieldName = assetIdFieldName || "_id";
    this.versionFieldName = versionFieldName || "version";
  }

  async createIndex() {
    if (this.collection === null) throw new VersionControllerNotInit();
    // do not need to create index for _id
    if (this.assetIdFieldName === "_id") return
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
