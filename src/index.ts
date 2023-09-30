import { PaymentHistoryMail } from "@/libs/Gmail/01PaymentHistoryMail";
import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";
import { NoticePaymentHistoryMessage } from "@/libs/Line/03NoticePaymentMessage";
import { SummaryMessage } from "@/libs/Line/04SummaryMessage";
import { Line } from "@/libs/Line/01Line";
import { PaymentHistorySheet } from "@/libs/SpreadSheet/02PaymentHistorySheet";
import { Setting } from "./00Setting";
import { FixedCostSheet } from "./libs/SpreadSheet/05FixedCostSheet";
import { PieChartSheet } from "./libs/SpreadSheet/04PieChartSheet";
import { SpreadSheet } from "./libs/SpreadSheet/01SpreadSheet";

const settings = new Setting();

const main = () => {
  const today = new Date();

  const mail = getRakutenMail();

  if (mail === undefined) return;

  const paymentHistoryMail = new PaymentHistoryMail(mail.getPlainBody());

  const messageReceivedDate = mail.getDate().toString();
  if (!shouldNoticeMessage(messageReceivedDate)) return;

  // 重複送信を避けるため、GAS の プロパティに受信日を保存しておく
  settings.setMessageDate(messageReceivedDate);

  const paymentHistoryList: PaymentHistory[] = paymentHistoryMail.buildPaymentHistoryList();

  savePaymentHistorySheet(paymentHistoryList);
  sendPaymentHistoryMessage(paymentHistoryList);

  if (!shouldCreateChart(today)) return;

  const last_month = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  createChart(last_month);
  sendSummaryMessage(last_month);
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
  const lineClient = new Line();
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
 * @param today new Date()
 */
const sendSummaryMessage = (today: Date) => {
  const lineClient = new Line();
  const targetYear = today.getFullYear().toString();
  const targetMonth = today.getMonth().toString();
  const fileName = `楽天カード決済履歴シート_${targetYear}`;
  const pieSheetName = `PieChartData-${targetMonth}月`;

  //FIXME: ほんとは date-fns を使いたい（GAS 上で外部モジュール使うのは一手間必要なので今回は諦めてる）
  const previousMonth = Number(targetMonth) - 1 === 0 ? 12 : Number(targetMonth) - 1;

  const spreadSheet = SpreadSheet.getSpreadsheet(fileName);
  const sheet = SpreadSheet.getSpreadSheetSheet(spreadSheet, `${targetMonth}月`);
  const previousSheet = SpreadSheet.getSpreadSheetSheet(spreadSheet, `${previousMonth}月`);

  const pieSheet = SpreadSheet.getSpreadSheetSheet(spreadSheet, pieSheetName);

  const masterSpreadSheet = SpreadSheet.getSpreadsheet(settings.MASTER_SPREAD_SHEET_FILE);
  const fixedSheet = SpreadSheet.getSpreadSheetSheet(masterSpreadSheet, "M_Fixed_cost");

  const paymentHistorySheet = new PaymentHistorySheet(spreadSheet, sheet);
  const previousPaymentHistorySheet = new PaymentHistorySheet(spreadSheet, previousSheet);
  const fixedCostSheet = new FixedCostSheet(masterSpreadSheet, fixedSheet);
  const pieChartSheet = new PieChartSheet(spreadSheet, pieSheet);

  const summaryMessage = new SummaryMessage(
    targetYear,
    targetMonth,
    fixedCostSheet,
    paymentHistorySheet,
    previousPaymentHistorySheet,
    pieChartSheet
  );

  lineClient.pushMessage(summaryMessage.buildSendMessage());
};
