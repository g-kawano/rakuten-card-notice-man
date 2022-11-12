import { Message } from "./message";
import { PaymentInfo } from "./paymentInfo";

const main = () => {
  const message = getRakutenMail();

  if (message) {
    const paymentInfo: PaymentInfo[] = parseMessage(message);

    for (const payment of paymentInfo) {
      //TODO: LINE 通知処理
      console.log(payment.date);
      console.log(payment.user);
      console.log(payment.store);
      console.log(payment.amount);
    }
  }
};

const getRakutenMail = (): string | undefined => {
  const threads = GmailApp.search('subject:"カード利用のお知らせ(本人・家族会員ご利用分)" -:"速報版"' , 1, 1);

  if (!threads) {
    return;
  }
  const mail = threads[0].getMessages();
  const message = mail[0].getPlainBody();
  return message;
};

const parseMessage = (message: string): PaymentInfo[] => {
  const paymentInfoList = [];
  const matched: RegExpMatchArray | null = message.match(new RegExp("■利用日.+? ポイント", "sg"));
  if (matched) {
    for (const paymentMessage of matched) {
      const m = new Message(paymentMessage);

      paymentInfoList.push(
        new PaymentInfo(m.getUseDay(), m.getUseStore(), m.getUser(), m.getAmount())
      );
    }
  }

  return paymentInfoList;
};
