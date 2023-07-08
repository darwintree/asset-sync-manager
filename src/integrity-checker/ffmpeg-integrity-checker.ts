import path from "path"
import { exec } from "child_process";
import { DownloadError } from "../errors";
import { IIntegrityChecker } from "../types/integrity-checker"

export class FfmpegIntegrityChecker implements IIntegrityChecker {
  shouldCheckIntegrity(assetId: string): boolean {
    const ext = path.extname(assetId).toLowerCase();
    return ext === ".mp4" || ext === ".m4a" || ext === ".jpg" || ext === ".png";
  }

  async checkIntegrity(localPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `ffmpeg -v error -i ${localPath} -f null -`,
        (error: any, stdout: any, stderr: any) => {
          if (error) {
            reject(new DownloadError(undefined, error));
          } else if (stderr) {
            reject(new DownloadError(`Integrity check failed: ${stderr}`));
          } else {
            resolve();
          }
        }
      );
    });
  }
}
