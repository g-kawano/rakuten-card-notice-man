import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";
import { BoxContent, TextContent, SeparatorContent } from "@/libs/Line/02LineMessage";
import { Setting } from "@/00Setting";
import { Message, FlexBox, FlexBubble, FlexImage, FlexSeparator } from "@line/bot-sdk";

const noticePaymentMessageSettings = new Setting();

/**
 * 決済情報通知メッセージ用クラス
 */
export class NoticePaymentHistoryMessage {
  type: FlexBubble["type"];
  header: FlexBox;
  body?: FlexBox;

  constructor(paymentHistoryList: PaymentHistory[]) {
    this.type = "bubble";
    this.header = this.getHeader();
    this.body = this.getBody(new PaymentHistoryList(paymentHistoryList));
  }

  /**
   * 送信メッセージを返す
   */
  buildSendMessage(): Message {
    return {
      type: "flex",
      altText: "カード利用のお知らせ",
      contents: {
        type: this.type,
        header: this.header,
        body: this.body,
      },
    };
  }

  /**
   * 通知メッセージのヘッダー部分を取得する
   * @returns Flex メッセージのヘッダーコンテント
   */
  getHeader(): FlexBox {
    const header = new BoxContent({ layout: "vertical", backgroundColor: "#E57F0FFF" });

    const headerContent = new TextContent({
      text: "カード利用のお知らせ",

      align: "center",
      color: "#FFFFFFFF",
      weight: "bold",
      size: "xl",
    });

    header.addContent(headerContent.textContent);

    return header.boxContent;
  }

  /**
   * 通知メッセージの本文を取得する
   * @param paymentHistoryList 決済情報リスト
   * @returns 通知メッセージ本文を表示するメッセージオブジェクト
   */
  getBody(paymentHistoryList: PaymentHistoryList): FlexBox {
    const bodyContent = new BoxContent({ layout: "vertical" });
    const himselfPaymentContent = this.buildPaymentHistoryMessage(paymentHistoryList, "himself");
    const familyPaymentContent = this.buildPaymentHistoryMessage(paymentHistoryList, "family");
    const allTotalAmountContent = this.buildTotalAmountRecord(paymentHistoryList, true);

    bodyContent.addContent(himselfPaymentContent.boxContent);
    bodyContent.addContent(new BoxContent({ layout: "vertical", margin: "lg" }).boxContent);
    bodyContent.addContent(familyPaymentContent.boxContent);
    bodyContent.addContent(new SeparatorContent("xl"));
    bodyContent.addContent(allTotalAmountContent.boxContent);

    return bodyContent.boxContent;
  }

  /**
   * 指定した利用者毎の決済情報メッセージを作成する
   * @param paymentHistoryList 決済情報リスト
   * @param userType himself or family
   * @returns 決済情報全体を表示するメッセージオブジェクト
   */
  buildPaymentHistoryMessage(paymentHistoryList: PaymentHistoryList, userType: "himself" | "family") {
    const paymentContent = new BoxContent({ layout: "vertical" });

    const subjectContent = this.buildSubjectMessage(userType);

    // 利用者毎にフィルタリングする
    const paymentList = paymentHistoryList.extractPerUser(userType);
    const paymentRecordsContent = this.buildPaymentMessage(paymentList);

    paymentContent.addContent(subjectContent.boxContent);
    paymentContent.addContent(paymentRecordsContent.boxContent);

    return paymentContent;
  }

  /**
   * 決済情報メッセージの件名部分を作成する
   * @param userType himself or family
   * @returns 決済情報の件名を表示するメッセージオブジェクト
   */
  buildSubjectMessage(userType: "himself" | "family"): BoxContent {
    let subject;

    const displayHimself =
      noticePaymentMessageSettings.DISPLAY_HIMSELF !== null ? noticePaymentMessageSettings.DISPLAY_HIMSELF : "本人";
    const displayFamily =
      noticePaymentMessageSettings.DISPLAY_HIMSELF !== null ? noticePaymentMessageSettings.DISPLAY_FAMILY : "家族";

    // メッセージ件名部分
    const subjectContent = new BoxContent({ layout: "vertical" });

    switch (userType) {
      case "himself":
        subject = new TextContent({ text: `利用者: ${displayHimself}`, weight: "bold" });
        break;
      case "family":
        subject = new TextContent({ text: `利用者: ${displayFamily}`, weight: "bold" });
        break;
    }
    const separator = new SeparatorContent("sm");
    subjectContent.addContent(subject.textContent);
    subjectContent.addContent(separator);

    return subjectContent;
  }

  /**
   * 決済通知メッセージの決済情報部分を作成する
   * @param paymentHistoryList
   * @returns 決済情報部分を表示するメッセージオブジェクト
   */
  buildPaymentMessage(paymentHistoryList: PaymentHistoryList): BoxContent {
    // メッセージ履歴レコード部分
    const paymentRecordsContent = new BoxContent({ layout: "vertical" });
    for (const paymentHistory of paymentHistoryList.paymentHistoryList) {
      paymentRecordsContent.addContent(this.buildPaymentMessageRecord(paymentHistory).boxContent);
    }

    // 合計金額
    const totalAmountRecordContent = this.buildTotalAmountRecord(paymentHistoryList);
    paymentRecordsContent.addContent(totalAmountRecordContent.boxContent);

    return paymentRecordsContent;
  }

  /**
   * 決済情報の 1 レコード部分を作成する
   * @param paymentHistory
   * @returns 決済情報の1 レコードを表示するッセージオブジェクト
   */
  buildPaymentMessageRecord(paymentHistory: PaymentHistory) {
    const paymentRecordContent = new BoxContent({ layout: "horizontal", margin: "xs", justifyContent: "flex-start" });

    const date = new TextContent({
      text: paymentHistory.date,
      flex: 3,
    });
    const store = new TextContent({
      text: paymentHistory.store,
      flex: 3,
    });
    const amount = new TextContent({
      text: paymentHistory.amount,
      align: "end",
      flex: 3,
      margin: "none",
    });

    paymentRecordContent.addContent(date.textContent);
    paymentRecordContent.addContent(store.textContent);
    paymentRecordContent.addContent(amount.textContent);

    return paymentRecordContent;
  }

  /**
   * トータル金額を表示するメッセージを作成する
   * @param paymentHistoryList 決済情報リスト
   * @param isAll true 全て、false 利用者毎
   * @returns 合計金額を表示するメッセージオブジェクト
   */
  buildTotalAmountRecord(paymentHistoryList: PaymentHistoryList, isAll: boolean = false) {
    const totalAmountRecordContent = new BoxContent({
      layout: "horizontal",
      margin: "sm",
      justifyContent: "flex-start",
    });

    const totalAmount = paymentHistoryList.calcTotalAmount();
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

    totalAmountRecordContent.addContent(totalSubject.textContent);
    totalAmountRecordContent.addContent(totalAmountContent.textContent);

    return totalAmountRecordContent;
  }
}
