import { Message } from "@/libs/Gmail/01Mail";
import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";
import { NoticePaymentHistoryMessage } from "@/libs/Line/03NoticePaymentMessage";
import { SummaryMessage } from "@/libs/Line/04SummaryMessage";
import { Line } from "@/libs/Line/01Line";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";

const MESSAGE_DATE = PropertiesService.getScriptProperties().getProperty("MESSAGE_DATE");

const main = () => {
  const today = new Date();
  const lineClient = new Line();

  const message = getRakutenMail();
  const messageBody = message?.getPlainBody();
  const messageDate = String(message?.getDate());

  if (messageBody && !isDuplicateMessageDate(messageDate)) {
    const paymentHistoryList: PaymentHistory[] = parseMessage(messageBody);

    // 決済履歴保存
    const paymentRecoreds = new PaymentHistoryList(paymentHistoryList);
    for (const record of paymentRecoreds.paymentHistoryList) {
      const fileName = `楽天カード決済履歴シート_${record.getYear()}`;
      const sheetName = `${record.getMonth()}月`;
      const sheet = new PaymentHistorySheet(fileName, sheetName);

      sheet.addPaymentsRecord(record);
    }

    // 通知メッセージ作成
    const noticePaymentHistoryMessage = new NoticePaymentHistoryMessage(paymentHistoryList);
    const pushMessage = {
      type: "flex",
      altText: "カード利用のお知らせ",
      contents: JSON.parse(JSON.stringify(noticePaymentHistoryMessage)),
    };

    lineClient.pushMessage(pushMessage);
  }

  // 毎月 15 日は前月のチャートを通知
  if (isCreateChart(today)) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const targetYear = today.getFullYear().toString();
    const targetMonth = (previousMonth.getMonth() + 1).toString();

    const fileName = `楽天カード決済履歴シート_${targetYear}`;
    const sheetName = `${targetMonth}月`;
    const sheet = new PaymentHistorySheet(fileName, sheetName);

    const summaryMessage = new SummaryMessage(targetYear, targetMonth);
    const pushMessage = {
      type: "flex",
      altText: "カード利用のお知らせ",
      contents: summaryMessage.pushMessageContent(),
    };

    sheet.createBarChart(targetMonth);
    sheet.createPieChart(targetMonth);
    lineClient.pushMessage(pushMessage);
  }
};

/**
 * Gmail の受信ボックスから楽天決済案内メールを取得する
 * @returns メール情報
 */
const getRakutenMail = (): GoogleAppsScript.Gmail.GmailMessage | undefined => {
  const threads = GmailApp.search('subject:"カード利用のお知らせ(本人・家族会員ご利用分)" -:"速報版"', 1, 1);

  if (!threads) {
    return;
  }
  const message = threads[0].getMessages();
  return message[0];
};

/**
 * メール本文から決済履歴の情報を抽出し、決済情報オブジェクトを取得する
 * @param message メール本文
 * @returns 決済情報オブジェクト
 */
const parseMessage = (message: string): PaymentHistory[] => {
  const paymentHistoryList = [];
  const matched: RegExpMatchArray | null = message.match(new RegExp("■利用日.+? ポイント", "sg"));
  if (matched) {
    for (const paymentMessage of matched) {
      const m = new Message(paymentMessage);
      paymentHistoryList.push(new PaymentHistory(m.getUseDay(), m.getUseStore(), m.getUser(), m.getAmount()));
    }
  }

  return paymentHistoryList;
};

/**
 * 取得したメール受信日時が、前回の受信日時と同一か判定する
 * @param messageDate メッセージの受信日時
 * @returns true: 一致、false: 一致しない
 */
const isDuplicateMessageDate = (messageDate: String | undefined) => {
  if (MESSAGE_DATE === String(messageDate)) return true;

  PropertiesService.getScriptProperties().setProperty("MESSAGE_DATE", String(messageDate));
  return false;
};

/**
 * 指定した日が、チャートを生成する日か判定する
 * @param targetDate
 */
const isCreateChart = (targetDate: Date): boolean => {
  return targetDate.getDate() === 15;
};
