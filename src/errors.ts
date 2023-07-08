// Base error
class AssetSyncManagerError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types

class VersionControllerError extends AssetSyncManagerError {
  constructor(message?: string) {
    super(message || "Version controller encountered an error");
  }
}

class VersionControllerNotInit extends VersionControllerError {
  constructor(message?: string) {
    super(message || "Version controller not inited");
  }
}

class PathControllerError extends AssetSyncManagerError {
  constructor(message?: string) {
    super(message || "Path controller encountered an error");
  }
}

class SyncError extends AssetSyncManagerError {
  constructor(message?: string) {
    super(message || "Synchronization encountered an error");
  }
}

export { VersionControllerNotInit };
