import { PaymentHistoryMail } from "@/libs/Gmail/01PaymentHistoryMail";

export class PaymentHistoryMailFactory {
  static create(rawMailMessage: string): PaymentHistoryMail {
    return new PaymentHistoryMail(rawMailMessage);
  }
}
