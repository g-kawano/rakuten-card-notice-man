import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";
import { PaymentHistorySheetFactory, PaymentHistoryDependencies } from "@/factories/PaymentHistorySheetFactory";
import { PieChartSheet } from "@/libs/SpreadSheet/04PieChartSheet";
import { FixedCostSheet } from "@/libs/SpreadSheet/05FixedCostSheet";
import { SummaryMessage } from "@/libs/Line/04SummaryMessage";
import { Setting } from "@/00Setting";

/**
 * 依存関係をまとめたクラス
 */
export class Dependencies {
  targetYear: string;
  targetMonth: string;
  fixedCostSheet: FixedCostSheet;
  paymentHistorySheet: PaymentHistorySheet;
  previousPaymentHistorySheet: PaymentHistorySheet;
  pieChartSheet: PieChartSheet;

  constructor(
    year?: string,
    month?: string,
    settings = new Setting(),
    masterSheetFileName?: string,
    paymentHistorySheetFileName?: string
  ) {
    this.targetYear = year || new Date().getFullYear().toString();
    this.targetMonth = month || new Date().getMonth().toString();
    const previousMonth = Number(this.targetMonth) - 1 === 0 ? 12 : Number(this.targetMonth) - 1;

    const masterSpreadSheet = masterSheetFileName
      ? SpreadSheet.getSpreadsheet(masterSheetFileName)
      : SpreadSheet.getSpreadsheet(settings.MASTER_SPREAD_SHEET_FILE);
    const paymentHistorySpreadSheet = paymentHistorySheetFileName
      ? SpreadSheet.getSpreadsheet(paymentHistorySheetFileName)
      : SpreadSheet.getSpreadsheet(`楽天カード決済履歴シート_${this.targetYear}`);

    const targetFixedSheet = SpreadSheet.getSpreadSheetSheet(masterSpreadSheet, "M_Fixed_cost");
    const targetPieChartSheet = SpreadSheet.getSpreadSheetSheet(
      paymentHistorySpreadSheet,
      `PieChartData-${this.targetMonth}月`
    );

    this.fixedCostSheet = new FixedCostSheet(masterSpreadSheet, targetFixedSheet);
    this.paymentHistorySheet = PaymentHistorySheetFactory.create();
    const paymentDeps = new PaymentHistoryDependencies(
      undefined,
      undefined,
      paymentHistorySheetFileName,
      `${previousMonth}月`
    );
    this.previousPaymentHistorySheet = PaymentHistorySheetFactory.create(paymentDeps);

    this.pieChartSheet = new PieChartSheet(paymentHistorySpreadSheet, targetPieChartSheet);
  }
}

/**
 * SummaryMessage クラスのインスタンスを生成するファクトリクラス
 */
export class SummaryMessageFactory {
  static create(deps?: Dependencies): SummaryMessage {
    const dependencies = deps || new Dependencies();
    const { targetYear, targetMonth, fixedCostSheet, paymentHistorySheet, previousPaymentHistorySheet, pieChartSheet } =
      dependencies;

    return new SummaryMessage(
      targetYear,
      targetMonth,
      fixedCostSheet,
      paymentHistorySheet,
      previousPaymentHistorySheet,
      pieChartSheet
    );
  }
}
