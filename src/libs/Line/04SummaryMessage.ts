import { BoxContent, TextContent, ImageContent, Separator, Filler } from "@/libs/Line/02LineMessage";
import { PaymentHistorySheet } from "../SpreadSheet/02PaymentHistorySheet";
import { FixedCostSheet } from "../SpreadSheet/05FixedCostSheet";
import { PieChartSheet } from "../SpreadSheet/04PieChartSheet";
import { Setting } from "@/00Setting";

const summaryMessagesSettings = new Setting()

/**
 * サマリーメッセージ用クラス
 */
export class SummaryMessage {
  type: string;
  header: BoxContent;
  body?: BoxContent;
  targetYear: string;
  targetMonth: string;
  fixedCostSheet: FixedCostSheet;

  constructor(targetYear: string, targetMonth: string) {
    this.type = "bubble";
    this.targetYear = targetYear;
    this.targetMonth = targetMonth;
    this.fixedCostSheet = new FixedCostSheet(summaryMessagesSettings.MASTER_SPREAD_SHEET_FILE, "M_Fixed_cost");

    this.header = this.makeHeaderContent();
    this.body = this.makeBodyContent();
  }

  /**
   * 送信メッセージ用のデータを返す
   */
  pushMessageContent() {
    return {
      type: this.type,
      header: JSON.parse(JSON.stringify(this.header)),
      body: JSON.parse(JSON.stringify(this.body)),
    };
  }

  /**
   * 指定した年、月の決済履歴シートクラスをインスタンス化して返す
   * @param targetYear 対象年
   * @param targetMonth 対象月
   */
  private newPaymentHistorySheet(targetYear: string, targetMonth: string): PaymentHistorySheet {
    const fileName = `楽天カード決済履歴シート_${targetYear}`;
    const sheetName = `${targetMonth}月`;
    return new PaymentHistorySheet(fileName, sheetName);
  }

  /**
   * flex メッセージのヘッダーの Box コンテントを作成して返す
   */
  makeHeaderContent(): BoxContent {
    const header = new BoxContent({ layout: "vertical", backgroundColor: "#1E90FF" });

    const headerContent = new TextContent({
      text: `${this.targetMonth} 月のまとめ💸`,
      align: "center",
      color: "#FFFFFFFF",
      weight: "bold",
      size: "xl",
    });

    header.addContent(headerContent);

    return header;
  }

  /**
   * flex メッセージのボディの Box コンテントを作成して返す
   */
  makeBodyContent(): BoxContent {
    const bodyContent = new BoxContent({ layout: "vertical" });

    bodyContent.addContent(this.makeSpendingContent());
    bodyContent.addContent(new Separator("md"));
    bodyContent.addContent(this.makePreviousMonthAmountComparison());
    bodyContent.addContent(this.makeFixedCostContent());
    bodyContent.addContent(new Separator("xl"));
    bodyContent.addContent(this.makePieChartImageContent());

    return bodyContent;
  }

  /**
   * ボディの収支表示用の Box コンテントを作成して返す
   */
  makeSpendingContent(): BoxContent {
    const paymentHistorySheet = this.newPaymentHistorySheet(this.targetYear, this.targetMonth);

    const spendingContent = new BoxContent({ layout: "horizontal" });

    const spendingKey = new TextContent({
      text: "支出：",
      weight: "bold",
      size: "md",
      flex: 4,
    });

    const totalAmount = paymentHistorySheet.sumColumn(2, 4) + this.fixedCostSheet.sumColumn(2, 3);
    const spendingValue = new TextContent({
      text: `¥ ${totalAmount.toLocaleString()}`,
      align: "end",
      flex: 5,
      size: "md",
      weight: "bold",
      decoration: "underline",
    });

    spendingContent.addContent(spendingKey);
    spendingContent.addContent(spendingValue);

    return spendingContent;
  }

  /**
   * 前月比を計算して返す
   * 当月の合計金額 - 前月の合計金額
   */
  calcPreviousMonthAmountComparison(): number {
    const month = Number(this.targetMonth);
    const previousMonth = month - 1 === 0 ? 12 : month - 1;

    const targetSheet = this.newPaymentHistorySheet(this.targetYear, this.targetMonth);

    const previousSheet = this.newPaymentHistorySheet(this.targetYear, String(previousMonth));

    return targetSheet.sumColumn(2, 4) - previousSheet.sumColumn(2, 4);
  }

  /**
   * ボディの前月比の Box コンテントを作成して返す
   */
  makePreviousMonthAmountComparison(): BoxContent {
    const amountComparisonContent = new BoxContent({ layout: "horizontal", margin: "md" });

    const filler = new Filler();

    const momKey = new TextContent({
      text: "前月比",
      weight: "bold",
      size: "md",
      flex: 4,
    });

    const amountComparison = this.calcPreviousMonthAmountComparison();

    const allow = amountComparison > 0 ? "↑" : "↓";
    const color = amountComparison > 0 ? "#FF0000" : "#1E90FF";

    const momValue = new TextContent({
      text: `${allow} ¥ ${amountComparison.toLocaleString()}`,
      align: "end",
      flex: 5,
      size: "md",
      weight: "bold",
      color: color,
    });

    amountComparisonContent.addContent(filler);
    amountComparisonContent.addContent(momKey);
    amountComparisonContent.addContent(momValue);

    return amountComparisonContent;
  }

  /**
   * 1 レコード分の固定費を表示する Box コンテントを作成して返す
   * @param isFirstRecord 最初のレコードかどうか
   * @param costName 固定費名
   * @param costValue 固定費金額
   */
  makeFixedCostContentRecord(isFirstRecord: boolean, costName: string, costValue: number): BoxContent {
    const fixedCostRecordContent = new BoxContent({
      layout: "horizontal",
      margin: "xs",
      justifyContent: "flex-start",
    });

    if (isFirstRecord) {
      const filler = new Filler();
      const fixedKeyContent = new TextContent({
        flex: 3,
        text: "固定費",
        size: "sm",
      });
      fixedCostRecordContent.addContent(filler);
      fixedCostRecordContent.addContent(fixedKeyContent);
    } else {
      const filler = new Filler(4);
      fixedCostRecordContent.addContent(filler);
    }

    const nameContent = new TextContent({
      text: costName,
      flex: 3,
      size: "sm",
    });

    const valueContent = new TextContent({
      text: `¥ ${costValue.toLocaleString()}`,
      flex: 3,
      align: "end",
    });

    fixedCostRecordContent.addContent(nameContent);
    fixedCostRecordContent.addContent(valueContent);

    return fixedCostRecordContent;
  }

  /**
   * ボディの固定費の Box コンテントを作成して返す
   */
  makeFixedCostContent(): BoxContent {
    const amountComparisonContent = new BoxContent({ layout: "vertical", margin: "sm" });

    for (const [index, record] of this.fixedCostSheet.scanRecord().entries()) {
      const isFirst = index === 0;

      const costName = record[0];
      const costValue = record[1];

      if (typeof costName !== "string") {
        throw new Error("Caught unexpected value!");
      }

      if (typeof costValue !== "number") {
        throw new Error("Caught unexpected value!");
      }

      amountComparisonContent.addContent(this.makeFixedCostContentRecord(isFirst, costName, costValue));
    }

    return amountComparisonContent;
  }

  /**
   * ボディの円グラフの Image コンテントを作成して返す
   */
  makePieChartImageContent(): ImageContent {
    const fileName = `楽天カード決済履歴シート_${this.targetYear}`;
    const sheetName = `PieChartData-${this.targetMonth}月`;

    const pieChartSheet = new PieChartSheet(fileName, sheetName);

    const chartFileName = `PieChart-${this.targetMonth}`;
    pieChartSheet.uploadChart(chartFileName);
    const imageUrl = pieChartSheet.downloadChartUrl(chartFileName);

    const pieChartImageContent = new ImageContent({
      url: imageUrl,
      size: "full",
      align: "center",
    });

    return pieChartImageContent;
  }
}
