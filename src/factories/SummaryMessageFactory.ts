import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";
import { PieChartSheet } from "@/libs/SpreadSheet/04PieChartSheet";
import { FixedCostSheet } from "@/libs/SpreadSheet/05FixedCostSheet";
import { SummaryMessage } from "@/libs/Line/04SummaryMessage";
import { Setting } from "@/00Setting";

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

    const targetPaymentHistorySheet = SpreadSheet.getSpreadSheetSheet(
      paymentHistorySpreadSheet,
      `${this.targetMonth}月`
    );
    const targetPreviousPaymentHistorySheet = SpreadSheet.getSpreadSheetSheet(
      paymentHistorySpreadSheet,
      `${previousMonth}月`
    );
    const targetFixedSheet = SpreadSheet.getSpreadSheetSheet(masterSpreadSheet, "M_Fixed_cost");
    const targetPieChartSheet = SpreadSheet.getSpreadSheetSheet(
      paymentHistorySpreadSheet,
      `PieChartData-${this.targetMonth}月`
    );

    this.fixedCostSheet = new FixedCostSheet(masterSpreadSheet, targetFixedSheet);
    this.paymentHistorySheet = new PaymentHistorySheet(paymentHistorySpreadSheet, targetPaymentHistorySheet);
    this.previousPaymentHistorySheet = new PaymentHistorySheet(
      paymentHistorySpreadSheet,
      targetPreviousPaymentHistorySheet
    );

    this.pieChartSheet = new PieChartSheet(paymentHistorySpreadSheet, targetPieChartSheet);
  }
}

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
