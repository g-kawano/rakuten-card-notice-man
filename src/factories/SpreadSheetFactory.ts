import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";

/**
 *  SpreadSheet クラスのインスタンスを生成する
 */
export class SpreadSheetFactory {
  /**
   * 対象の spreadSheet の操作クラスを取得する
   * 既に作成されている場合はファイル ID で読み込み、ない場合は新規作成し、その結果を返す
   * @param fileName  対象spreadSheet ファイル名
   * @param DriveApp GAS の ドライブ操作ライブラリ
   * @param spreadSheetApp GAS の シート操作ライブラリ
   * @returns
   */
  static createGasSpreadsheet(
    fileName: string,
    driveApp: GoogleAppsScript.Drive.DriveApp = DriveApp,
    spreadSheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp = SpreadsheetApp
  ): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const files = driveApp.searchFiles("title contains " + "'" + fileName + "'");
    let spreadSheet;
    if (files.hasNext()) {
      const fileId = files.next().getId();
      spreadSheet = spreadSheetApp.openById(fileId);
    } else {
      spreadSheet = spreadSheetApp.create(fileName);
    }

    return spreadSheet;
  }

  /**
   * 対象の spreadSheet の Sheet 操作クラスを取得する(ex, 楽天カード決済履歴シート_2022 ファイルの "1月"シート)
   * 既に作成されている場合はシート名で読み込み、ない場合は新規作成し、その結果を返す
   * @param spreadSheet 対象の spreadSheet の操作クラス
   * @param targetSheetName 対象の spreadSheet のシート名
   * @returns
   */
  static createGasSpreadSheetSheet(
    spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    targetSheetName: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    let activeSheet: GoogleAppsScript.Spreadsheet.Sheet;
    // 当月のシートがない場合は作成する
    const targetSheet = spreadSheet.getSheetByName(targetSheetName);
    if (!targetSheet) {
      activeSheet = spreadSheet.insertSheet(targetSheetName);
    } else {
      activeSheet = spreadSheet.setActiveSheet(targetSheet);
    }

    return activeSheet;
  }

  static create(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    return new SpreadSheet(sheet);
  }

  static createFromFileName(
    fileName: string,
    sheetName: string,
    driveApp: GoogleAppsScript.Drive.DriveApp = DriveApp,
    spreadSheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp = SpreadsheetApp
  ): SpreadSheet {
    const spreadSheet = this.createGasSpreadsheet(fileName, driveApp, spreadSheetApp);
    const sheet = this.createGasSpreadSheetSheet(spreadSheet, sheetName);

    return this.create(sheet);
  }
}
