import { PaymentInfoList } from "./paymentInfo";

type AggregatedData = {
  [dateString: string]: number;
};

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

  /**
   * 指定した 年月の棒グラフ を シートに挿入する
   * @param targetYear yyyy
   * @param targetMonth mm
   */
  createBarChart(targetYear: string, targetMonth: string): void {
    const fileName = this.fileNamePrefix + targetYear;
    const sheetFile = this.getSpreadsheet(fileName);
    const targetSheet = this.getSpreadSheetSheet(sheetFile, targetMonth + "月");

    const dataRange = targetSheet.getDataRange();
    const dateValues: Date[][] = targetSheet.getRange(1, 1, dataRange.getNumRows(), 1).getValues().slice(1);
    const amountValues: number[][] = targetSheet.getRange(1, 4, dataRange.getNumRows(), 1).getValues().slice(1);

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
    const chartDataSheet = this.getSpreadSheetSheet(sheetFile, `BarChartData-${targetMonth}月`);
    chartDataSheet.getRange(1, 1, chartDataValues.length, 2).setValues(chartDataValues);

    // グラフを作成
    var chart = targetSheet
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
    targetSheet.insertChart(chart);
  }
}
