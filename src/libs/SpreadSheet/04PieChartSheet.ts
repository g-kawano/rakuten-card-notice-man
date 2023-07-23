import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { DriveFactory } from "@/factories/DriveFactory";
import { Setting } from "@/00Setting";

/**
 * 円グラフシート操作用クラス
 */
export class PieChartSheet extends SpreadSheet {
  setting: Setting;
  constructor(
    spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    setting = new Setting()
  ) {
    super(spreadSheet, sheet);
    this.setting = setting;
  }

  /**
   * スプレッドシートのチャートの画像データを取得する
   */
  private getChartImg(): GoogleAppsScript.Base.Blob {
    const graph = this.sheet.getCharts();
    return graph[0].getBlob();
  }

  /**
   * スプレッドシートのチャート画像を ドライブにアップロードする
   * @param fileName アップロードするファイル名
   */
  uploadChart(fileName: string): void {
    const drive = DriveFactory.create();
    const graphImg = this.getChartImg();
    const folder = drive.findFolderByName(this.setting.DRIVE_FOLDER_NAME);
    folder.createFile(graphImg.setName(fileName));
  }

  /**
   * チャートの画像URLをダウンロードする
   */
  downloadChartUrl(fileName: string): string {
    const drive = DriveFactory.create();
    const file = drive.findFileByName(fileName);

    if (file === null) {
      throw new Error("File does not exist!");
    }
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    return file.getDownloadUrl();
  }
}
