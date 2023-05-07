import { PaymentInfo, PaymentInfoList } from "./02PaymentInfo";
import { BoxContent, TextContent, Saparator } from "./04LineMessage";

const DISPLAY_HIMSELF = PropertiesService.getScriptProperties().getProperty("DISPLAY_HIMSELF");
const DISPLAY_FAMILIY = PropertiesService.getScriptProperties().getProperty("DISPLAY_FAMILIY");

/**
 * 決済情報通知メッセージ用クラス
 */
export class NoticePaymentHistoryMessage {
  type: string;
  header: BoxContent;
  body?: BoxContent;

  constructor(paymentInfoList: PaymentInfo[]) {
    this.type = "bubble";
    this.header = this.getHeader();
    this.body = this.getBody(new PaymentInfoList(paymentInfoList));
  }

  /**
   * 通知メッセージのヘッダー部分を取得します。
   * @returns Flex メッセージのヘッダーコンテント
   */
  getHeader() {
    const header = new BoxContent({ layout: "vertical", backgroundColor: "#E57F0FFF" });
    const headerContent = new TextContent({
      text: "カード利用のお知らせ",
      align: "center",
      color: "#FFFFFFFF",
      weight: "bold",
      size: "xl",
    });
    header.addContent(headerContent);

    return header;
  }

  /**
   * 通知メッセージの本文を取得します
   * @param paymentInfoList 決済情報リスト
   * @returns 通知メッセージ本文を表示するメッセージオブジェクト
   */
  getBody(paymentInfoList: PaymentInfoList) {
    const bodyContent = new BoxContent({ layout: "vertical" });
    const himselfPaymentContent = this.createPaymentHistoryMessage(paymentInfoList, "himself");
    const familiyPaymentContent = this.createPaymentHistoryMessage(paymentInfoList, "familiy");
    const allTotalAmountContent = this.createTotalAmountRecord(paymentInfoList, true);

    bodyContent.addContent(himselfPaymentContent);
    bodyContent.addContent(new BoxContent({ layout: "vertical", margin: "lg" }));
    bodyContent.addContent(familiyPaymentContent);
    bodyContent.addContent(new Saparator("xl"));
    bodyContent.addContent(allTotalAmountContent);

    return bodyContent;
  }

  /**
   * 指定した利用者毎の決済情報メッセージを作成します。
   * @param paymentInfoList 決済情報リスト
   * @param userType himself or familiy
   * @returns 決済情報全体を表示するメッセージオブジェクト
   */
  createPaymentHistoryMessage(paymentInfoList: PaymentInfoList, userType: "himself" | "familiy") {
    const paymentContent = new BoxContent({ layout: "vertical" });

    const subjectContent = this.createSubjectMessage(userType);

    // 利用者毎にフィルタリングする
    const paymentList = paymentInfoList.extractPerUser(userType);
    const paymentRecordsContent = this.createPaymentMessage(paymentList);

    paymentContent.addContent(subjectContent);
    paymentContent.addContent(paymentRecordsContent);

    return paymentContent;
  }

  /**
   * 決済情報メッセージの件名部分を作成します。
   * @param userType himself or familiy
   * @returns 決済情報の件名を表示するメッセージオブジェクト
   */
  createSubjectMessage(userType: "himself" | "familiy"): BoxContent {
    let subject;

    const displayHimself = DISPLAY_HIMSELF ? DISPLAY_HIMSELF : "本人";
    const displayFamiliy = DISPLAY_HIMSELF ? DISPLAY_FAMILIY : "家族";

    // メッセージ件名部分
    const subjectContent = new BoxContent({ layout: "vertical" });

    switch (userType) {
      case "himself":
        subject = new TextContent({ text: `利用者: ${displayHimself}`, weight: "bold" });
        break;
      case "familiy":
        subject = new TextContent({ text: `利用者: ${displayFamiliy}`, weight: "bold" });
        break;
    }
    const separator = new Saparator("sm");
    subjectContent.addContent(subject);
    subjectContent.addContent(separator);

    return subjectContent;
  }

  /**
   * 決済通知メッセージの決済情報部分を作成します。
   * @param paymentInfoList
   * @returns 決済情報部分を表示するメッセージオブジェクト
   */
  createPaymentMessage(paymentInfoList: PaymentInfoList): BoxContent {
    // メッセージ履歴レコード部分
    const paymentRecordsContent = new BoxContent({ layout: "vertical" });
    for (const paymentInfo of paymentInfoList.paymentInfoList) {
      paymentRecordsContent.addContent(this.createPaymentMessageRecord(paymentInfo));
    }

    // 合計金額
    const totalAmountRecordContent = this.createTotalAmountRecord(paymentInfoList);
    paymentRecordsContent.addContent(totalAmountRecordContent);

    return paymentRecordsContent;
  }

  /**
   * 決済情報の 1 レコード部分を作成します。
   * @param paymentInfo
   * @returns 決済情報の1 レコードを表示するッセージオブジェクト
   */
  createPaymentMessageRecord(paymentInfo: PaymentInfo) {
    const paymentRecordContent = new BoxContent({ layout: "horizontal", margin: "xs", justifyContent: "flex-start" });

    const date = new TextContent({
      text: paymentInfo.date,
      flex: 3,
    });
    const store = new TextContent({
      text: paymentInfo.store,
      flex: 3,
    });
    const amount = new TextContent({
      text: paymentInfo.amount,
      align: "end",
      flex: 3,
      margin: "none",
    });

    paymentRecordContent.addContent(date);
    paymentRecordContent.addContent(store);
    paymentRecordContent.addContent(amount);

    return paymentRecordContent;
  }

  /**
   * トータル金額を表示するメッセージを作成します。
   * @param paymentInfoList 決済情報リスト
   * @param isAll true 全て、false 利用者毎
   * @returns 合計金額を表示するメッセージオブジェクト
   */
  createTotalAmountRecord(paymentInfoList: PaymentInfoList, isAll: boolean = false) {
    const totalAmountRecordContent = new BoxContent({
      layout: "horizontal",
      margin: "sm",
      justifyContent: "flex-start",
    });

    const totalAmount = paymentInfoList.calcTotalAmount();
    const subjectText = isAll ? "合計" : "計";

    const totalSubject = new TextContent({
      text: subjectText,
      align: "end",
      flex: 4,
    });

    const totalAmountContent = new TextContent({
      text: `${totalAmount.toLocaleString()} 円`,
      align: "end",
      flex: 2,
    });

    totalAmountRecordContent.addContent(totalSubject);
    totalAmountRecordContent.addContent(totalAmountContent);

    return totalAmountRecordContent;
  }
}
