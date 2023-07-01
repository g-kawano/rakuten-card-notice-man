import { BoxContent, TextContent, ImageContent, SeparatorContent, FillerContent } from "@/libs/Line/02LineMessage";
import { PaymentHistorySheet } from "../SpreadSheet/02PaymentHistorySheet";
import { FixedCostSheet } from "../SpreadSheet/05FixedCostSheet";
import { PieChartSheet } from "../SpreadSheet/04PieChartSheet";
import { FlexBox, Message } from "@line/bot-sdk";

/**
 * サマリーメッセージ用クラス
 */
export class SummaryMessage {
  targetYear: string;
  targetMonth: string;
  fixedCostSheet: FixedCostSheet;
  paymentHistorySheet: PaymentHistorySheet;
  previousPaymentHistorySheet: PaymentHistorySheet;
  pieChartSheet: PieChartSheet;

  constructor(
    targetYear: string,
    targetMonth: string,
    fixedCostSheet: FixedCostSheet,
    paymentHistorySheet: PaymentHistorySheet,
    previousPaymentHistorySheet: PaymentHistorySheet,
    pieChartSheet: PieChartSheet
  ) {
    this.targetYear = targetYear;
    this.targetMonth = targetMonth;
    this.fixedCostSheet = fixedCostSheet;
    this.paymentHistorySheet = paymentHistorySheet;
    this.previousPaymentHistorySheet = previousPaymentHistorySheet;
    this.pieChartSheet = pieChartSheet;
  }

  /**
   * 送信メッセージを返す
   */
  buildSendMessage(): Message {
    return {
      type: "flex",
      altText: "サマリーメッセージ",
      contents: {
        type: "bubble",
        header: this.buildHeaderContent(),
        body: this.buildBodyContent()
      }
    };
  }

  /**
   * flex メッセージのヘッダーの Box コンテントを作成して返す
   */
  buildHeaderContent(): FlexBox {
    const header = new BoxContent({ layout: "vertical", backgroundColor: "#1E90FF" });

    const headerContent = new TextContent({
      text: `${this.targetMonth} 月のまとめ💸`,
      align: "center",
      color: "#FFFFFFFF",
      weight: "bold",
      size: "xl"
    });

    header.addContent(headerContent.textContent);

    return header.boxContent;
  }

  /**
   * flex メッセージのボディの Box コンテントを作成して返す
   */
  buildBodyContent(): FlexBox {
    const bodyContent = new BoxContent({ layout: "vertical" });

    bodyContent.addContent(this.buildSpendingContent());
    bodyContent.addContent(new SeparatorContent("md"));
    bodyContent.addContent(this.buildPreviousMonthAmountComparison());
    bodyContent.addContent(this.buildFixedCostContent());
    bodyContent.addContent(new SeparatorContent("xl"));
    bodyContent.addContent(this.buildPieChartImageContent());

    return bodyContent.boxContent;
  }

  /**
   * ボディの収支表示用の Box コンテントを作成して返す
   */
  buildSpendingContent(): FlexBox {
    const spendingContent = new BoxContent({ layout: "horizontal" });

    const spendingKey = new TextContent({
      text: "支出：",
      weight: "bold",
      size: "md",
      flex: 4
    });

    const totalAmount = this.paymentHistorySheet.sumColumn(2, 4) + this.fixedCostSheet.sumColumn(2, 3);

    const spendingValue = new TextContent({
      text: `¥ ${totalAmount.toLocaleString()}`,
      align: "end",
      flex: 5,
      size: "md",
      weight: "bold",
      decoration: "underline"
    });

    spendingContent.addContent(spendingKey.textContent);
    spendingContent.addContent(spendingValue.textContent);

    return spendingContent.boxContent;
  }

  /**
   * 前月比を計算して返す
   * 当月の合計金額 - 前月の合計金額
   */
  calcPreviousMonthAmountComparison(): number {
    return this.paymentHistorySheet.sumColumn(2, 4) - this.previousPaymentHistorySheet.sumColumn(2, 4);
  }

  /**
   * ボディの前月比の Box コンテントを作成して返す
   */
  buildPreviousMonthAmountComparison(): FlexBox {
    const amountComparisonContent = new BoxContent({ layout: "horizontal", margin: "md" });

    const filler = new FillerContent();

    const momKey = new TextContent({
      text: "前月比",
      weight: "bold",
      size: "md",
      flex: 4
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
      color: color
    });

    amountComparisonContent.addContent(filler);
    amountComparisonContent.addContent(momKey.textContent);
    amountComparisonContent.addContent(momValue.textContent);

    return amountComparisonContent.boxContent;
  }

  /**
   * 1 レコード分の固定費を表示する Box コンテントを作成して返す
   * @param isFirstRecord 最初のレコードかどうか
   * @param costName 固定費名
   * @param costValue 固定費金額
   */
  buildFixedCostContentRecord(isFirstRecord: boolean, costName: string, costValue: number): FlexBox {
    const fixedCostRecordContent = new BoxContent({
      layout: "horizontal",
      margin: "xs",
      justifyContent: "flex-start"
    });

    if (isFirstRecord) {
      const filler = new FillerContent();
      const fixedKeyContent = new TextContent({
        flex: 3,
        text: "固定費",
        size: "sm"
      });
      fixedCostRecordContent.addContent(filler);
      fixedCostRecordContent.addContent(fixedKeyContent.textContent);
    } else {
      const filler = new FillerContent(4);
      fixedCostRecordContent.addContent(filler);
    }

    const nameContent = new TextContent({
      text: costName,
      flex: 3,
      size: "sm"
    });

    const valueContent = new TextContent({
      text: `¥ ${costValue.toLocaleString()}`,
      flex: 3,
      align: "end"
    });

    fixedCostRecordContent.addContent(nameContent.textContent);
    fixedCostRecordContent.addContent(valueContent.textContent);

    return fixedCostRecordContent.boxContent;
  }

  /**
   * ボディの固定費の Box コンテントを作成して返す
   */
  buildFixedCostContent(): FlexBox {
    const amountComparisonContent = new BoxContent({ layout: "vertical", margin: "sm" });

    for (const [index, record] of this.fixedCostSheet.scanRecord().entries()) {
      const isFirst = index === 0;

      const costName = record[0];
      const costValue = record[1];

      if (typeof costName !== "string") {
        throw new Error("Cost name is not string!");
      }

      if (typeof costValue !== "number") {
        throw new Error("Cost value is not number!");
      }

      amountComparisonContent.addContent(this.buildFixedCostContentRecord(isFirst, costName, costValue));
    }

    return amountComparisonContent.boxContent;
  }

  /**
   * ボディの円グラフの Image コンテントを作成して返す
   */
  buildPieChartImageContent(): ImageContent {
    const chartFileName = `PieChart-${this.targetMonth}`;
    this.pieChartSheet.uploadChart(chartFileName);
    const imageUrl = this.pieChartSheet.downloadChartUrl(chartFileName);

    const pieChartImageContent = new ImageContent({
      url: imageUrl,
      size: "full",
      align: "center"
    });

    return pieChartImageContent;
  }
}
