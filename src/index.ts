import { PaymentHistoryMail } from "@/libs/Gmail/01PaymentHistoryMail";
import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";
import { NoticePaymentHistoryMessage } from "@/libs/Line/03NoticePaymentMessage";
import { SummaryMessage } from "@/libs/Line/04SummaryMessage";
import { Line } from "@/libs/Line/01Line";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";

const MESSAGE_DATE = PropertiesService.getScriptProperties().getProperty("MESSAGE_DATE");

const main = () => {
  const today = new Date();

  const mail = getRakutenMail();

  if (mail === undefined) return;

  const paymentHistoryMail = new PaymentHistoryMail(mail.getPlainBody());

  const messageReceivedDate = mail.getDate().toString();
  if (!shouldNoticeMessage(messageReceivedDate)) return;

  // 重複送信を避けるため、GAS の プロパティに受信日を保存しておく
  PropertiesService.getScriptProperties().setProperty("MESSAGE_DATE", String(messageReceivedDate));

  const paymentHistoryList: PaymentHistory[] = paymentHistoryMail.buildPaymentHistoryList();

  savePaymentHistorySheet(paymentHistoryList);
  sendPaymentHistoryMessage(paymentHistoryList);

  if (!shouldCreateChart(today)) return;

  createChart(today);
  sendSummaryMessage(today);
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
 * チャートを生成するかどうか
 * @param targetDate
 */
const shouldCreateChart = (targetDate: Date): boolean => {
  return targetDate.getDate() === 15;
};

/**
 * 通知をするかどうか
 * @param targetDate
 */
const shouldNoticeMessage = (messageDate: string): boolean => {
  return MESSAGE_DATE === String(messageDate);
};

/**
 *  決済履歴情報をスプレッドシートに保存する
 * @param paymentHistoryList 決済履歴情報リストクラス
 */
const savePaymentHistorySheet = (paymentHistoryList: PaymentHistory[]) => {
  // 決済履歴保存
  const paymentRecords = new PaymentHistoryList(paymentHistoryList);
  for (const record of paymentRecords.paymentHistoryList) {
    const fileName = `楽天カード決済履歴シート_${record.getYear()}`;
    const sheetName = `${record.getMonth()}月`;
    const sheet = new PaymentHistorySheet(fileName, sheetName);

    sheet.addPaymentsRecord(record);
  }
};

/**
 * 決済履歴情報を LINE に送信する
 * @param paymentHistoryList 決済履歴情報リストクラス
 */
const sendPaymentHistoryMessage = (paymentHistoryList: PaymentHistory[]) => {
  const lineClient = new Line();
  // 通知メッセージ作成
  const noticePaymentHistoryMessage = new NoticePaymentHistoryMessage(paymentHistoryList);
  const pushMessage = {
    type: "flex",
    altText: "カード利用のお知らせ",
    contents: JSON.parse(JSON.stringify(noticePaymentHistoryMessage)),
  };

  lineClient.pushMessage(pushMessage);
};

/**
 * チャートを作成する
 * @param today new Date()
 */
const createChart = (today: Date) => {
  const targetYear = today.getFullYear().toString();
  const targetMonth = today.getMonth().toString();

  const fileName = `楽天カード決済履歴シート_${targetYear}`;
  const sheetName = `${targetMonth}月`;
  const sheet = new PaymentHistorySheet(fileName, sheetName);

  sheet.createBarChart(targetMonth);
  sheet.createPieChart(targetMonth);
};

/**
 * サマリーメッセージを LINE に送信する
 * @param today new Date()
 */
const sendSummaryMessage = (today: Date) => {
  const lineClient = new Line();
  const targetYear = today.getFullYear().toString();
  const targetMonth = today.getMonth().toString();

  const summaryMessage = new SummaryMessage(targetYear, targetMonth);
  const pushMessage = {
    type: "flex",
    altText: "カード利用のお知らせ",
    contents: summaryMessage.pushMessageContent(),
  };

  lineClient.pushMessage(pushMessage);
};
