import { PaymentHistory} from "@/libs/01PaymentHistory";

/**
 * 決済履歴メールクラス
 */
export class PaymentHistoryMail {
  rowMailMessage: string;

  constructor(rowMailMessage: string) {
    this.rowMailMessage = rowMailMessage;
  }

  /**
   * メール内容から正規表現で対象データを抽出する
   * @param prefix 抽出する情報の prefix 文字列
   * @return
   * 	[ '■利用日: 2023/06/01\r\n■利用先: ﾃｽﾄ\r\n■利用者: 家族\r\n■支払方法: 1回\r\n■利用金額: 123 円\r\n■支払月: 2023/07\r\n■カード利用獲得ポイント:\r\n　1 ポイント', '■利用日: 2023/06/01\r\n■利用先: ﾃｽﾄ\r\n■利用者: 家族\r\n■支払方法: 1回\r\n■利用金額: 123 円\r\n■支払月: 2023/07\r\n■カード利用獲得ポイント:\r\n　1 ポイント', ...],
   */
  private extractPaymentInfo = (prefix: string, message: string): string => {
    const matched: RegExpMatchArray | null = message.match(`${prefix}.+`);
    return matched ? matched[0].replace(prefix, "") : "";
  };

  /**
   * 決済案内メール本文から、決済情報が記載されている部分を抽出する
   */
  extractPaymentMessages(): RegExpMatchArray | null {
    return this.rowMailMessage.match(new RegExp("■利用日.+? ポイント", "sg"));
  }

  buildPaymentHistory(paymentMessage: string): PaymentHistory {
    const day = this.extractPaymentInfo("■利用日: ", paymentMessage);
    const store = this.extractPaymentInfo("■利用先: ", paymentMessage);
    const user = this.extractPaymentInfo("■利用者: ", paymentMessage);
    const amount = this.extractPaymentInfo("■利用金額: ", paymentMessage);
    return new PaymentHistory(day, store, user, amount);
  }

  buildPaymentHistoryList(): PaymentHistory[] {
    const paymentHistoryList = [];
    const paymentMessages = this.extractPaymentMessages();
    if (paymentMessages !== null) {
      for (const paymentMessage of paymentMessages) {
        paymentHistoryList.push(this.buildPaymentHistory(paymentMessage));
      }
    }

    return paymentHistoryList;
  }
}
