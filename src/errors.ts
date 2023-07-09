// Base error
class AssetSyncManagerError extends Error {
  public innerError?: Error;

  constructor(message?: string, innerError?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.innerError = innerError;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types

class VersionControllerError extends AssetSyncManagerError {
  constructor(message?: string, innerError?: Error) {
    super(message || "Version controller encountered an error", innerError);
  }
}

class PathControllerError extends AssetSyncManagerError {
  constructor(message?: string, innerError?: Error) {
    super(message || "Path controller encountered an error", innerError);
  }
}

class SyncError extends AssetSyncManagerError {
  constructor(message?: string, innerError?: Error) {
    super(message || "Synchronization encountered an error", innerError);
  }
}

class VersionControllerNotInit extends VersionControllerError {
  constructor(message?: string, innerError?: Error) {
    super(message || "Version controller not inited", innerError);
  }
}


class DownloadError extends SyncError {
  constructor(message?: string, innerError?: Error) {
    super(message, innerError);
  }
}

export { VersionControllerNotInit, DownloadError, AssetSyncManagerError };
