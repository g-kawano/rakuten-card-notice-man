import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";

/**
 * 店舗カテゴリーシート操作用クラス
 */
export class StoreCategorySheet extends SpreadSheet {
  constructor(spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet, sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    super(spreadSheet, sheet);
    this.sheet = sheet;
  }

  /**
   * 店舗名が一致する カテゴリー名を取得する
   * @param storeName 店舗名
   */
  searchCategoryByStoreName(sheetName: string, storeName: string): string {
    const queryString = `=QUERY(${sheetName}!A2:D, "SELECT D WHERE C = '${storeName}'", 0)`;

    const tempSheet = this.spreadSheet.insertSheet("TempQuerySheet");
    tempSheet.getRange("A1").setValue(queryString);

    // クエリの結果を取得
    var categoryName = tempSheet.getRange("A1").getValue();

    // 一時シートを削除
    this.spreadSheet.deleteSheet(tempSheet);

    return categoryName !== "#N/A" ? categoryName : "";
  }
}
