/**
 * Google Drive 操作用クラス
 */
export class Drive {
  private driveApp: GoogleAppsScript.Drive.DriveApp;

  constructor(driveApp: GoogleAppsScript.Drive.DriveApp = DriveApp) {
    this.driveApp = driveApp;
  }

  /**
   * 指定したフォルダー名のフォルダーを返す
   * @param folderName フォルダー名
   */
  findFolderByName(folderName: string): GoogleAppsScript.Drive.Folder {
    const folders = this.driveApp.getFoldersByName(folderName);
    while (folders.hasNext()) {
      return folders.next();
    }
    throw new Error(`Folder "${folderName}" does not exist.`);
  }

  /**
   * 指定したファイル名のファイルを返す
   * @param fileName ファイル名
   */
  findFileByName(fileName: string): GoogleAppsScript.Drive.File {
    var files = this.driveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      return files.next();
    }

    throw new Error(`File "${fileName}" does not exist.`);
  }

  /**
   * 指定したフォルダー内のファイルを削除する
   * 削除するファイルは最初にヒットした１件
   * @param folderName フォルダー名
   * @param fileName ファイル名
   */
  deleteFile(folderName: string, fileName: string) {
    const folder = this.findFolderByName(folderName);
    folder.getFilesByName(fileName).next().setTrashed(true);
  }
}
