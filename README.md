# Asset Sync Manager

Asset Sync Manager 用于从远程服务器同步资源到本地的node库，并且能够管理本地资源版本。

## 安装

使用 npm/yarn 安装：

```bash
npm install asset-sync-manager
yarn add asset-sync-manager
```

如果需要使用包中提供的 `MongodbVersionController` 实现，则需要额外[安装 mongodb](https://www.mongodb.com/) 与对应的 `mongodb` 库。

```bash
npm install asset-sync-manager mongodb
yarn add asset-sync-manager mongodb
```

## 使用

### 例子

`asset-sync-manager` 使用插件式的方式进行初始化。初始化时需要提供VersionController，PathController与可选的IntegrityChecker。

1. VersionController 用于管理本地资源的版本。包中提供了mongodb实现。
2. PathController 用于提供资源id（`assetId`）与远程资源路径、本地资源路径的映射关系。
3. IntegrityChecker 为可选参数，用于检查下载至本地资源的完整性。

在 `example/index.ts` 中提供了示例：

```typescript
import {
  SyncManager,
  PathController,
  VersionController,
  utils,
  IntegrityChecker,
} from "../dist";

const FfmpegIntegrityChecker = IntegrityChecker.FfmpegIntegrityChecker;
const MongodbVersionController = VersionController.MongodbVersionController;
const {
  constructDefaultGetRemotePath,
  constructDefaultGetLocalPath,
  // constructDefaultVersionedGetLocalPath // 文件存储路径与 version 相关的简单实现
} = PathController;

async function main() {
  const versionController = new MongodbVersionController({
    uri: "mongodb://127.0.0.1:27017",
    dbName: "test",
    collectionName: "assets",
  });
  await versionController.init();
  const pathController = {
    // 提供资源的baseUrl
    getRemotePath: constructDefaultGetRemotePath("https://static.example.com"),
    // 提供资源放置的本地目录
    getLocalPath: constructDefaultGetLocalPath("./assets"),
    // 资源下载使用的临时目录
    getTmpLocalPath: constructDefaultGetLocalPath("./tmp"),
  };
  const syncManager = new SyncManager(
    versionController,
    pathController,
    // 可选参数，用于检查下载至本地的图片/视频的完整性，为空时不进行完整性检验
    // 需要安装 ffmpeg
    new FfmpegIntegrityChecker(), 
    {
      logger: console, // 可选参数，日志输出的方式，为空时会输出至 "error.log" 与 "conbined.log" 文件中
    }
  );

  // 需要提供的 assetId 与 version 索引
  const assetEntry = {
    "video/1.mp4": 1,
    "img/114514.png": 2,
    "json/88888.json": 3,
    "json/secret/1919810.json": 5,
  };

  await syncManager.syncAll(assetEntry, {
    assetIdFilters: {
      assetIdIncludeFilters: [utils.constructPrefixFilter(["json/"])],
      assetIdExcludeFilters: [utils.constructPrefixFilter(["json/secret"])],
    }, // 从assetEntry中筛选出需要同步的asset。二者均为空时同步所有资源。否则筛选出满足前者且不满足后者的资源
    concurrency: 16, // 下载资源时的并行数
    removeLegacy: false, // 是否删除旧版本文件（若版本不同时，文件路径不变，则此选项无影响）
  });
}

main()
  .then(() => {
    console.log("finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 实现插件

`src/types` 中包含了插件接口的定义。用户可以根据需求实现插件。

#### VersionController

```ts
export interface IVersionController<T> {
  init(): Promise<void>;
  shouldSync(assetId: string, remoteVersion: T): Promise<boolean>;
  upsertLocalVersion(assetId: string, version: T): Promise<void>;
  getLocalVersion(assetId: string): Promise<T | null>;
  isRemoteVersionNewer(remoteVersion: T, localVersion: T): boolean;
}
```

接口实现可以参考包中 [MongodbVersionController](./src/version-controller/mongodb-version-controller.ts)。

#### PathController

```ts
// src/types/path-controller.ts
export type GetPath<T> = (assetId: string, version: T) => string;
export type ResolvePath<T> = (path: string) => {
  assetId: string;
  version: T;
};
export interface IPathController<T> {
  getRemotePath: GetPath<T>;
  getLocalPath: GetPath<T>;
  getTmpLocalPath: GetPath<T>;
  resolveRemotePath?: ResolvePath<T>; // no use now
  resolveLocalPath?: ResolvePath<T>; // no use now
}
```

#### IntegrityChecker

```ts
export interface IIntegrityChecker {
  shouldCheckIntegrity: (assetId: string) => boolean;
  checkIntegrity: (localPath: string) => Promise<void>; // throw an error if not integrity
}
```
