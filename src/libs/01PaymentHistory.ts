/**
 * 決済情報クラス
 */
export class PaymentHistory {
  date: string;
  store: string;
  user: string;
  amount: string;

  constructor(date: string, store: string, user: string, amount: string) {
    this.date = date;
    this.store = store;
    this.user = user;
    this.amount = amount;
  }

  /**
   * amount(合計金額)を 文字列から数値に変換します。
   * @returns 数値にキャストした合計値
   */
  castAmountStringToNumber(): number {
    const amount = this.amount.replace(/,|円/, "");

    // 半角のカンマを取り除いた文字列を number 型にキャストする
    return parseInt(amount, 10) || parseFloat(amount);
  }

  getYear(): string {
    return this.date.split("/")[0];
  }

  getMonth(): string {
    return this.date.split("/")[1].slice(1);
  }

  /**
   * スプレッドシートに書き込無む用のレコードデータを取得します。
   * @returns レコード
   */
  getSheetRecord(): (string | number)[] {
    return [this.date, this.store, this.user, this.castAmountStringToNumber()];
  }
}

/**
 * 決済情報のリストクラス
 */
export class PaymentHistoryList {
  paymentHistoryList: PaymentHistory[];

  constructor(paymentHistoryList: PaymentHistory[]) {
    this.paymentHistoryList = paymentHistoryList;
  }

  /**
   * 指定した利用者ごとの履歴を抽出します。
   * @param userType himself 本人、familiy 家族
   * @returns 指定した利用者の決済情報リスト
   */
  extractPerUser(userType: "himself" | "familiy"): PaymentHistoryList {
    switch (userType) {
      case "himself":
        const himselfPayment = this.paymentHistoryList.filter((payment) => payment.user === "本人");
        return new PaymentHistoryList(himselfPayment);

      case "familiy":
        const familyPayment = this.paymentHistoryList.filter((payment) => payment.user === "家族");
        return new PaymentHistoryList(familyPayment);
    }
  }
  /**
   * 合計金額を計算します。
   * @returns 合計金額
   */
  calcTotalAmount() {
    const regex = /[^0-9]/g;

    let totalAmount = this.paymentHistoryList.reduce((sum, payment) => {
      const result = payment.amount.replace(regex, "");
      const amount = parseInt(result);
      return sum + amount;
    }, 0);

    return totalAmount;
  }

  /**
   * スプレッドシートに書き込無む用のレコードデータを取得します。
   * @returns レコード
   */
  getSheetRecords(): (string | number)[][] {
    let records = [];
    for (const paymentHistory of this.paymentHistoryList) {
      const record = [];
      record.push(paymentHistory.date, paymentHistory.store, paymentHistory.user, paymentHistory.castAmountStringToNumber());
      records.push(record);
    }

    return records;
  }
}
