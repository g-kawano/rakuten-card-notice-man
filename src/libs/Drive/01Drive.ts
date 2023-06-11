/**
 * Google Drive 操作用クラス
 */
export class Drive {
  /**
   * フォルダーID を返す
   * なければ null を返す
   */
  private getFolderIdByFolderName(folderName: string): string | null {
    const folders = DriveApp.getFolders();
    while (folders.hasNext()) {
      var folder = folders.next();
      if (folder.getName() === folderName) {
        return folder.getId();
      }
    }
    return null;
  }

  /**
   * 指定したフォルダ名の folder インスタンスを返す
   * @param folderName フォルダ名
   */
  createDriveFolderByFolderName(folderName: string): GoogleAppsScript.Drive.Folder {
    const folderId = this.getFolderIdByFolderName(folderName);

    if (folderId === null) {
      throw new Error("folder id is null!");
    }

    return DriveApp.getFolderById(folderId);
  }

  /**
   * 指定したファイル名の file インスタンスを返す
   * @param fileName ファイル名
   */
  createDriveFileByName(fileName: string): GoogleAppsScript.Drive.File | null {
    var files = DriveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      var file = files.next();
      return file;
    } else {
      return null;
    }
  }

  /**
   * 指定したフォルダー内のファイルを削除する
   * 削除するファイルは最初にヒットした１件
   * @param folderName フォルダー名
   * @param fileName ファイル名
   */
  deleteFile(folderName: string, fileName: string) {
    const folder = this.createDriveFolderByFolderName(folderName);
    folder.getFilesByName(fileName).next().setTrashed(true);
  }
}
