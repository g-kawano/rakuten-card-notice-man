import { PaymentHistoryMailFactory } from "@/factories/PaymentHistoryMailFactory";
import { LineFactory } from "@/factories/LineFactory";
import { SummaryMessageFactory } from "@/factories/SummaryMessageFactory";
import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";
import { NoticePaymentHistoryMessage } from "@/libs/Line/03NoticePaymentMessage";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";
import { Setting } from "./00Setting";
import { SpreadSheet } from "./libs/SpreadSheet/01SpreadSheet";

const settings = new Setting();

const main = () => {
  const today = new Date();

  const mail = getRakutenMail();

  if (mail === undefined) return;

  const paymentHistoryMail = PaymentHistoryMailFactory.create(mail.getPlainBody());

  const messageReceivedDate = mail.getDate().toString();
  if (!shouldNoticeMessage(messageReceivedDate)) return;

  // 重複送信を避けるため、GAS の プロパティに受信日を保存しておく
  settings.setMessageDate(messageReceivedDate);

  const paymentHistoryList: PaymentHistory[] = paymentHistoryMail.buildPaymentHistoryList();

  savePaymentHistorySheet(paymentHistoryList);
  sendPaymentHistoryMessage(paymentHistoryList);

  if (!shouldCreateChart(today)) return;

  createChart(today);
  sendSummaryMessage();
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
  return settings.MESSAGE_DATE !== String(messageDate);
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

    const spreadSheet = SpreadSheet.getSpreadsheet(fileName);
    const sheet = SpreadSheet.getSpreadSheetSheet(spreadSheet, sheetName);

    const paymentHistorySheet = new PaymentHistorySheet(SpreadSheet.getSpreadsheet(fileName), sheet);

    paymentHistorySheet.addPaymentsRecord(record);
  }
};

/**
 * 決済履歴情報を LINE に送信する
 * @param paymentHistoryList 決済履歴情報リストクラス
 */
const sendPaymentHistoryMessage = (paymentHistoryList: PaymentHistory[]) => {
  const lineClient = LineFactory.create();
  // 通知メッセージ作成
  const noticeMessages = new NoticePaymentHistoryMessage(paymentHistoryList);

  lineClient.pushMessage(noticeMessages.buildSendMessage());
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

  const spreadSheet = SpreadSheet.getSpreadsheet(fileName);
  const sheet = SpreadSheet.getSpreadSheetSheet(spreadSheet, sheetName);

  const paymentHistorySheet = new PaymentHistorySheet(spreadSheet, sheet);

  paymentHistorySheet.createBarChart(targetMonth);
  paymentHistorySheet.createPieChart(targetMonth);
};

/**
 * サマリーメッセージを LINE に送信する
 */
const sendSummaryMessage = () => {
  const lineClient = LineFactory.create();
  const summaryMessage = SummaryMessageFactory.create();

  lineClient.pushMessage(summaryMessage.buildSendMessage());
};
