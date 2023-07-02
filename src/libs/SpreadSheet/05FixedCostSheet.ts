import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";

/**
 * 固定費シート操作用クラス
 */
export class FixedCostSheet extends SpreadSheet {
  constructor(spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet, sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    super(spreadSheet, sheet);
  }

  /**
   * ヘッダーとID を除いた全レコードデータを取得する
   */
  scanRecord(): (string | number)[][] {
    const lastRow = this.sheet.getLastRow();

    // 固定日名と金額の列を取得
    const range = this.sheet.getRange(2, 2, lastRow - 1, 2);
    return range.getValues();
  }
}
