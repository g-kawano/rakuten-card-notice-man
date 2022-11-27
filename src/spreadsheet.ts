/**
 * スプレットシート操作用クラス
 */
export class SpreadSheet {
  activeSheet: GoogleAppsScript.Spreadsheet.Sheet;
  header: String[] = ["日時", "使用店舗", "利用者", "利用金額"];

  constructor({ fileName, targetSheetName }: { fileName: string; targetSheetName: string }) {
    const spreadSheet = this.getSpreadsheet(fileName);
    this.activeSheet = this.getSpreadSheetSheet(spreadSheet, targetSheetName);
  }

  /**
   * 対象の spreadSheet の操作クラスを取得します
   * 既に作成されている場合はファイル ID で読み込み、ない場合は新規作成し、その結果を返します。
   * @param fileName  対象spreadSheet ファイル名
   * @returns
   */
  getSpreadsheet(fileName: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
    const files = DriveApp.searchFiles("title contains " + "'" + fileName + "'");
    let spreadSheet;
    if (files.hasNext()) {
      const fileId = files.next().getId();
      spreadSheet = SpreadsheetApp.openById(fileId);
    } else {
      spreadSheet = SpreadsheetApp.create(fileName);
    }

    return spreadSheet;
  }

  /**
   * 対象の spreadSheet の Sheet 操作クラスを取得します(ex, 楽天カード決済履歴シート_2022 ファイルの "1月"シート)
   * 既に作成されている場合はシート名で読み込み、ない場合は新規作成し、その結果を返します。
   * @param spreadSheet 対象の spreadSheet の操作クラス
   * @param targetSheetName 対象の spreadSheet のシート名
   * @returns
   */
  getSpreadSheetSheet(
    spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    targetSheetName: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    let activeSheet;
    // 当月のシートがない場合は作成する
    const targetSheet = spreadSheet.getSheetByName(targetSheetName);
    if (!targetSheet) {
      activeSheet = spreadSheet.insertSheet(targetSheetName);
      activeSheet.appendRow(this.header);
    } else {
      activeSheet = spreadSheet.setActiveSheet(targetSheet);
    }

    return activeSheet;
  }

  /**
   * 対象のスプレッドシートの末尾に行を追加します。
   * @param records 追加するレコード
   */
  addRecords(records: (string | number)[][]): void {
    const values = this.activeSheet.getDataRange().getValues();

    for (const record of records) {
      values.push(record);
    }
    const column = this.activeSheet.getDataRange().getLastColumn();
    const row = values.length;

    //書き出し
    this.activeSheet.getRange(1, 1, row, column).setValues(values);
  }
}
