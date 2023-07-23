import { NoticePaymentHistoryMessage } from "@/libs/Line/03NoticePaymentMessage";
import { PaymentHistory } from "@/libs/01PaymentHistory";
import { Setting } from "@/00Setting";

export class NoticePaymentHistoryMessageFactory {
  /**
   * NoticePaymentHistoryMessage インスタンスを作成する
   * @param paymentHistoryList 決済情報リスト
   */
  static create(paymentHistoryList: PaymentHistory[], setting = new Setting()): NoticePaymentHistoryMessage {
    return new NoticePaymentHistoryMessage(paymentHistoryList, setting);
  }
}
