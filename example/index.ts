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
    new FfmpegIntegrityChecker(), // 可选参数，用于检查下载至本地的图片/视频的完整性，为空时不进行完整性检验
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
