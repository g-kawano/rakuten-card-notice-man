import { Setting } from "@/00Setting";
import { SpreadSheetFactory } from "./SpreadSheetFactory";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";

/**
 * 依存関係をまとめたクラス
 */
export class PaymentHistoryDependencies {
  year?: string;
  month?: string;
  paymentHistorySheet: GoogleAppsScript.Spreadsheet.Sheet;
  setting: Setting;

  constructor(year?: string, month?: string, fileName?: string, sheetName?: string, setting = new Setting()) {
    const targetYear = year || new Date().getFullYear().toString();
    const targetMonth = month || new Date().getMonth().toString();

    const targetFileName = fileName || `楽天カード決済履歴シート_${targetYear}`;
    const targetSheetName = sheetName || `${targetMonth}月`;

    const paymentHistorySpreadSheet = SpreadSheetFactory.createFromFileName(targetFileName, targetSheetName);

    this.setting = setting;
    this.paymentHistorySheet = paymentHistorySpreadSheet.sheet;
  }
}
/**
 * PaymentHistorySheetを生成するファクトリクラス
 */
export class PaymentHistorySheetFactory {
  /**
   * 新規PaymentHistorySheetを生成する
   * @param sheetName シート名
   * @param setting 設定情報
   */
  static create(deps?: PaymentHistoryDependencies): PaymentHistorySheet {
    const dependencies = deps || new PaymentHistoryDependencies();
    const { paymentHistorySheet, setting } = dependencies;

    return new PaymentHistorySheet(paymentHistorySheet, setting);
  }
}
