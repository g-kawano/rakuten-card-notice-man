import { PaymentHistoryMail } from "@/libs/Gmail/01PaymentHistoryMail";

export class PaymentHistoryMailFactory {
  /**
   * PaymentHistoryMail インスタンスを作成する
   * @param rawMailMessage メールの生データ
   */
  static create(rawMailMessage: string): PaymentHistoryMail {
    return new PaymentHistoryMail(rawMailMessage);
  }
}
