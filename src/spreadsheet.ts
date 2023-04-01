import { PaymentInfoList } from "./paymentInfo";

/**
 * スプレットシート操作用クラス
 */
export class SpreadSheet {
  header: String[] = ["日時", "使用店舗", "利用者", "利用金額"];
  fileNamePrefix: String = "楽天カード決済履歴シート_";

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
   * 明細の使用日ごとに対象のファイル及びシートの末尾に履歴を追記します。
   * @param records 追加するレコード
   */
  addRecords(records: PaymentInfoList): void {
    for (const record of records.paymentInfoList) {
      const targeSheetName = this.fileNamePrefix + record.getYear();
      const sheet = this.getSpreadsheet(targeSheetName);
      const targetSheet = this.getSpreadSheetSheet(sheet, record.getMonth() + "月");
      const values = targetSheet.getDataRange().getValues();

      values.push(record.getSheetRecord());

      const column = targetSheet.getDataRange().getLastColumn();
      const row = values.length;

      //書き出し
      targetSheet.getRange(1, 1, row, column).setValues(values);
    }
  }
}
