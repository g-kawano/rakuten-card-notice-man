/**
 * 決済情報クラス
 */
export class PaymentInfo {
  date: string;
  store: string;
  user: string;
  amount: string;

  /**
   * amount(合計金額)を 文字列から数値に変換します。
   * @returns 数値にキャストした合計値
   */
  castAmountStringToNumber(): number {
    const amount = this.amount.replace(/,|円/, "");

    // 半角のカンマを取り除いた文字列を number 型にキャストする
    return parseInt(amount, 10) || parseFloat(amount);
  }

  constructor(date: string, store: string, user: string, amount: string) {
    this.date = date;
    this.store = store;
    this.user = user;
    this.amount = amount;
  }
}

/**
 * 決済情報のリストクラス
 */
export class PaymentInfoList {
  paymentInfoList: PaymentInfo[];

  constructor(paymentInfoList: PaymentInfo[]) {
    this.paymentInfoList = paymentInfoList;
  }

  /**
   * 指定した利用者ごとの履歴を抽出します。
   * @param userType himself 本人、familiy 家族
   * @returns 指定した利用者の決済情報リスト
   */
  extractPerUser(userType: "himself" | "familiy"): PaymentInfoList {
    switch (userType) {
      case "himself":
        const himselfPayment = this.paymentInfoList.filter((payment) => payment.user === "本人");
        return new PaymentInfoList(himselfPayment);

      case "familiy":
        const familyPayment = this.paymentInfoList.filter((payment) => payment.user === "家族");
        return new PaymentInfoList(familyPayment);
    }
  }

  /**
   * 合計金額を計算します。
   * @returns 合計金額
   */
  calcTotalAmount() {
    const regex = /[^0-9]/g;

    let totalAmount = this.paymentInfoList.reduce((sum, payment) => {
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
    for (const paymentInfo of this.paymentInfoList) {
      const record = [];
      record.push(paymentInfo.date, paymentInfo.store, paymentInfo.user, paymentInfo.castAmountStringToNumber());
      records.push(record);
    }

    return records;
  }
}
