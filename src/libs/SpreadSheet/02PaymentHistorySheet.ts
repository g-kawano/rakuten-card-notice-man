import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { PaymentHistory } from "@/libs/01PaymentHistory";
import { StoreCategorySheet } from "@/libs/SpreadSheet/03StoreCategorySheet";

type AggregatedDataPerDate = {
  [datestring: string]: number;
};

type AggregatedDataPerCategory = {
  [categoryName: string]: number;
};

const MASTER_SPREAD_SHEET_FILE = PropertiesService.getScriptProperties().getProperty("MASTER_SPREAD_SHEET_FILE");

/**
 * 決済履歴スプレットシート操作用クラス
 */
export class PaymentHistorySheet extends SpreadSheet {
  header: String[] = ["日時", "使用店舗", "利用者", "利用金額", "カテゴリー"];

  constructor(fileName: string, sheetName: string) {
    super(fileName, sheetName);
    //sheet が 0 行の場合は、ヘッダーを追加する
    const countRow = this.sheet.getDataRange().getNumRows();
    // スプレッドシートはデフォルトで 1 行目が含まれている
    if (countRow === 1) {
      this.sheet.appendRow(this.header);
    }
  }

  /**
   * 決済履歴を追加する
   * @param records 追加するレコード
   */
  addPaymentsRecord(record: PaymentHistory): void {
    if (MASTER_SPREAD_SHEET_FILE !== null) {
      // 使用店舗のカテゴリーを取得する
      const storeCategory = new StoreCategorySheet(MASTER_SPREAD_SHEET_FILE, "JOIN_store_category");
      const category = storeCategory.searchCategoryByStoreName(record.store);

      //TODO: カテゴリーを取得できなかった場合は、M_store シートにレコードを追加する
      // 実際は以下のケースが考えられるが、現状は 1. のみを考慮する
      // 1. M_storeに店舗が登録されていない
      // 2. T_store_category にレコードが追加されていない（←ここは手動 or 将来的に LINE BOT から設定できるようにする）
      const addRecord = record.getSheetRecord();
      addRecord.push(category);
      super.addRecords([addRecord]);
    }
  }

  /**
   * 利用金額の合計を算出して返す
   */
  totalAmount(): number {
    const lastRow = this.sheet.getLastRow();

    // 利用金額の列の範囲を取得
    const range = this.sheet.getRange(2, 4, lastRow - 1);
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

  /**
   * 指定した 年月の棒グラフ を シートに挿入する
   * @param targetMonth チャート対象の月 (ex. 5月の場合：5, 12 月の場合: 12)
   */
  createBarChart(targetMonth: string): void {
    const dataRange = this.sheet.getDataRange();
    const dateValues: Date[][] = this.sheet.getRange(2, 1, dataRange.getNumRows(), 1).getValues();
    const amountValues: number[][] = this.sheet.getRange(2, 4, dataRange.getNumRows(), 1).getValues();

    // デフォルトで末尾の空行がついてくるので消す
    dateValues.pop();
    amountValues.pop();

    // 同じ日時の利用金額を合計
    const aggregatedData = dateValues.reduce<AggregatedDataPerDate>((acc, date, index) => {
      const dateString = date[0].toLocaleDateString();
      const amount = amountValues[index][0];

      if (acc[dateString]) {
        acc[dateString] += amount;
      } else {
        acc[dateString] = amount;
      }

      return acc;
    }, {});

    // 日時と利用金額のデータを結合
    const chartDataValues: [string, string][] = Object.entries(aggregatedData).map(([date, amount]) => [
      Utilities.formatDate(new Date(date), "JST", "MM/dd"),
      amount.toLocaleString(),
    ]);

    // データを日付の昇順でソート
    chartDataValues.sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime();
    });

    // 結合されたデータを新しいシートにコピー
    const chartDataSheet = super.getSpreadSheetSheet(this.spreadSheet, `BarChartData-${targetMonth}月`);
    chartDataSheet.getRange(1, 1, chartDataValues.length, 2).setValues(chartDataValues);

    // グラフを作成
    var chart = chartDataSheet
      .newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(chartDataSheet.getRange(1, 1, chartDataValues.length, 2))
      .setPosition(2, 4, 0, 0)
      .setOption("title", `${targetMonth}月の利用日別金額`)
      .setOption("hAxis.title", "日時")
      .setOption("vAxis", {
        title: "利用金額",
        logScale: true,
        gridlines: {
          count: 50,
        },
      })
      .setOption("hAxis.format", "MM/dd") // 横軸の日付フォーマットを MM/dd に設定
      .setOption("hAxis.slantedText", true) // 斜めのテキストを有効にする
      .setOption("hAxis.slantedTextAngle", 45) // テキストの角度を45度に設定
      .setOption("hAxis.viewWindowMode", "pretty") // 横軸の表示間隔を調整
      .build();

    // グラフをシートに挿入
    chartDataSheet.insertChart(chart);
  }

  /**
   * 指定した カテゴリー別円グラフ を シートに挿入する
   * @param targetMonth チャート対象の月 (ex. 5月の場合：5, 12 月の場合: 12)
   */
  createPieChart(targetMonth: string): void {
    const dataRange = this.sheet.getDataRange();
    const amountValues: number[][] = this.sheet.getRange(2, 4, dataRange.getNumRows(), 1).getValues();
    const categoryValues: string[][] = this.sheet.getRange(2, 5, dataRange.getNumRows(), 1).getValues();

    // 同じカテゴリーの利用金額を合計
    const aggregatedData = categoryValues.reduce<AggregatedDataPerCategory>((acc, category, index) => {
      const categoryName = category[0];
      const amount = amountValues[index][0];

      if (acc[categoryName]) {
        acc[categoryName] += amount;
      } else {
        acc[categoryName] = amount;
      }

      return acc;
    }, {});

    // 日時と利用金額のデータを結合
    const chartDataValues: [string, string][] = Object.entries(aggregatedData).map(([category, amount]) => {
      const categoryName = category === "" ? "未カテゴリー" : category;
      return [`${categoryName} ${amount.toLocaleString()} 円`, amount.toLocaleString()];
    });

    // 結合されたデータを新しいシートにコピー
    const chartDataSheet = super.getSpreadSheetSheet(this.spreadSheet, `PieChartData-${targetMonth}月`);
    chartDataSheet.getRange(1, 1, chartDataValues.length, 2).setValues(chartDataValues);

    // グラフを作成
    const chart = chartDataSheet
      .newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(chartDataSheet.getRange(1, 1, chartDataValues.length, 2))
      .setOption("title", `${targetMonth}月のカテゴリー別金額`)
      .setOption("height", 400)
      .setOption("width", 600)
      .setOption("is3D", true)
      .setOption("pieHole", 0.2)
      .setOption("pieSliceText", "value")
      .setOption("aggregationTarget", "category")
      .setOption("legend.position", "right")
      .setPosition(2, 4, 0, 0)
      .setOption("pieSliceText", "none")
      .build();

    // グラフをシートに挿入
    chartDataSheet.insertChart(chart);
  }
}
