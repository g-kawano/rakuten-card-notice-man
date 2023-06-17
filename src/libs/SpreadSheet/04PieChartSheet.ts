import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { Drive } from "@/libs/Drive/01Drive";
import { Setting } from "@/00Setting";

const pieChartSheetSettings = new Setting();

/**
 * 円グラフシート操作用クラス
 */
export class PieChartSheet extends SpreadSheet {
  sheetName: string;
  constructor(fileName: string, sheetName: string) {
    super(fileName, sheetName);
    this.sheetName = sheetName;
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
    const drive = new Drive();
    const graphImg = this.getChartImg();
    const folder = drive.findFolderByName(pieChartSheetSettings.DRIVE_FOLDER_NAME);
    folder.createFile(graphImg.setName(fileName));
  }

  /**
   * チャートの画像URLをダウンロードする
   */
  downloadChartUrl(fileName: string): string {
    const drive = new Drive();
    const file = drive.findFileByName(fileName);

    if (file === null) {
      throw new Error("File does not exist!");
    }
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    return file.getDownloadUrl();
  }
}
