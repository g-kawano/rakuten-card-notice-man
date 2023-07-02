/**
 * スプレットシート操作用クラス
 * @property spreadSheet  スプしレッドシートファイルインスタンス
 * @property sheet  スプレッドシート内の１シートインスタンス
 */
export class SpreadSheet {
  spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  protected sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet, sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.spreadSheet = spreadSheet;
    this.sheet = sheet;
  }

  /**
   * 対象の spreadSheet の操作クラスを取得する
   * 既に作成されている場合はファイル ID で読み込み、ない場合は新規作成し、その結果を返す
   * @param fileName  対象spreadSheet ファイル名
   * @returns
   */
  static getSpreadsheet(fileName: string): GoogleAppsScript.Spreadsheet.Spreadsheet {
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
   * 対象の spreadSheet の Sheet 操作クラスを取得する(ex, 楽天カード決済履歴シート_2022 ファイルの "1月"シート)
   * 既に作成されている場合はシート名で読み込み、ない場合は新規作成し、その結果を返す
   * @param spreadSheet 対象の spreadSheet の操作クラス
   * @param targetSheetName 対象の spreadSheet のシート名
   * @returns
   */
  static getSpreadSheetSheet(
    spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    targetSheetName: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    let activeSheet;
    // 当月のシートがない場合は作成する
    const targetSheet = spreadSheet.getSheetByName(targetSheetName);
    if (!targetSheet) {
      activeSheet = spreadSheet.insertSheet(targetSheetName);
    } else {
      activeSheet = spreadSheet.setActiveSheet(targetSheet);
    }

    return activeSheet;
  }

  /**
   * 対象のシートの末尾にレコードを追加する
   * @param records 追加するレコード
   */
  addRecords<T>(records: T[][]): void {
    for (const record of records) {
      const values = this.sheet.getDataRange().getValues();

      values.push(record);

      const column = this.sheet.getDataRange().getLastColumn();
      const row = values.length;

      //書き出し
      this.sheet.getRange(1, 1, row, column).setValues(values);
    }
  }

  /**
   * 対象列の合計を算出して返す
   * @param rowNumber 開始行番号
   * @param columnNumber 列番号
   */
  sumColumn(startRowNumber: number, columnNumber: number): number {
    const lastRow = this.sheet.getLastRow();

    //対象列の範囲を取得
    const range = this.sheet.getRange(startRowNumber, columnNumber, lastRow - 1);
    const values = range.getValues();

    let totalAmount = 0;

    for (const record of values) {
      let amount = record[0];
      if (typeof amount === "number") {
        totalAmount += amount;
      }
    }

    return totalAmount;
  }
}
