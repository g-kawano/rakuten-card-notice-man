import { SpreadSheet } from "@/libs/SpreadSheet/01SpreadSheet";
import { PaymentHistory } from "@/libs/01PaymentHistory";
import { StoreCategorySheet } from "@/libs/SpreadSheet/03StoreCategorySheet";

type AggregatedData = {
  [dateString: string]: number;
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
   * 決済履歴を追加します。
   * @param records 追加するレコード
   */
  addPaymentsRecord(record: PaymentHistory): void {
    if (MASTER_SPREAD_SHEET_FILE !== null) {
      // 使用店舗のカテゴリーを取得する
      const storeCategory = new StoreCategorySheet(MASTER_SPREAD_SHEET_FILE, "JOIN_store_category");
      const category = storeCategory.searchCategoryByStoreName(record.store);

      //TODO: カテゴリーを取得できなかった場合は、M_store シートにレコードを追加する
      // 実際は以下のケースが考えられるが、現状は 1. のみを考慮する。
      // 1. M_storeに店舗が登録されていない
      // 2. T_store_category にレコードが追加されていない（←ここは手動 or 将来的に LINE BOT から設定できるようにする）
      const addRecord = record.getSheetRecord();
      addRecord.push(category);
      super.addRecords([addRecord]);
    }
  }

  /**
   * 指定した 年月の棒グラフ を シートに挿入する
   * @param targetMonth mm
   */
  //TODO: どちらかというと、グラフ用のサービスファイルなどをつくってそっちに実装したい
  createBarChart(targetMonth: string): void {
    const dataRange = this.sheet.getDataRange();
    const dateValues: Date[][] = this.sheet.getRange(1, 1, dataRange.getNumRows(), 1).getValues().slice(1);
    const amountValues: number[][] = this.sheet.getRange(1, 4, dataRange.getNumRows(), 1).getValues().slice(1);

    // 同じ日時の利用金額を合計
    const aggregatedData = dateValues.slice(1).reduce<AggregatedData>((acc, date, index) => {
      const dateString = date[0].toLocaleDateString();
      const amount = amountValues[index + 1][0];

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
    var chart = this.sheet
      .newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(chartDataSheet.getRange(1, 1, chartDataValues.length, 2))
      .setPosition(5, 6, 0, 0)
      .setOption("title", `${targetMonth}月の利用金額`)
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
    this.sheet.insertChart(chart);
  }
}
