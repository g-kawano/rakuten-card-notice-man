import { PaymentHistory, PaymentHistoryList } from "@/libs/01PaymentHistory";
import { BoxContentFactory, TextContentFactory, SeparatorContentFactory } from "@/factories/LineMessageFactory";
import { Setting } from "@/00Setting";
import { Message, FlexBox, FlexBubble } from "@line/bot-sdk";

/**
 * 決済情報通知メッセージ用クラス
 */
export class NoticePaymentHistoryMessage {
  type: FlexBubble["type"];
  header: FlexBox;
  body?: FlexBox;
  setting: Setting;

  constructor(paymentHistoryList: PaymentHistory[], setting: Setting = new Setting()) {
    this.setting = setting;
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
        body: this.body
      }
    };
  }

  /**
   * 通知メッセージのヘッダー部分を取得する
   * @returns Flex メッセージのヘッダーコンテント
   */
  getHeader(): FlexBox {
    const header = BoxContentFactory.create({ layout: "vertical", backgroundColor: "#E57F0FFF" });

    const headerContent = TextContentFactory.create({
      text: "カード利用のお知らせ",

      align: "center",
      color: "#FFFFFFFF",
      weight: "bold",
      size: "xl"
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
    const bodyContent = BoxContentFactory.create({ layout: "vertical" });
    const himselfPaymentContent = this.buildPaymentHistoryMessage(paymentHistoryList, "himself");
    const familyPaymentContent = this.buildPaymentHistoryMessage(paymentHistoryList, "family");
    const allTotalAmountContent = this.buildTotalAmountRecord(paymentHistoryList, true);

    bodyContent.addContent(himselfPaymentContent);
    bodyContent.addContent(BoxContentFactory.create({ layout: "vertical", margin: "lg" }).boxContent);
    bodyContent.addContent(familyPaymentContent);
    bodyContent.addContent(SeparatorContentFactory.create("xl"));
    bodyContent.addContent(allTotalAmountContent);

    return bodyContent.boxContent;
  }

  /**
   * 指定した利用者毎の決済情報メッセージを作成する
   * @param paymentHistoryList 決済情報リスト
   * @param userType himself or family
   * @returns 決済情報全体を表示するメッセージオブジェクト
   */
  buildPaymentHistoryMessage(paymentHistoryList: PaymentHistoryList, userType: "himself" | "family"): FlexBox {
    const paymentContent = BoxContentFactory.create({ layout: "vertical" });

    const subjectContent = this.buildSubjectMessage(userType);

    // 利用者毎にフィルタリングする
    const paymentList = paymentHistoryList.extractPerUser(userType);
    const paymentRecordsContent = this.buildPaymentMessage(paymentList);

    paymentContent.addContent(subjectContent);
    paymentContent.addContent(paymentRecordsContent);

    return paymentContent.boxContent;
  }

  /**
   * 決済情報メッセージの件名部分を作成する
   * @param userType himself or family
   * @returns 決済情報の件名を表示するメッセージオブジェクト
   */
  buildSubjectMessage(userType: "himself" | "family"): FlexBox {
    let subject;

    // メッセージ件名部分
    const subjectContent = BoxContentFactory.create({ layout: "vertical" });

    switch (userType) {
      case "himself":
        const displayHimself = this.setting.DISPLAY_HIMSELF !== null ? this.setting.DISPLAY_HIMSELF : "本人";
        subject = TextContentFactory.create({ text: `利用者: ${displayHimself}`, weight: "bold" });
        break;
      case "family":
        const displayFamily = this.setting.DISPLAY_FAMILY !== null ? this.setting.DISPLAY_FAMILY : "家族";
        subject = TextContentFactory.create({ text: `利用者: ${displayFamily}`, weight: "bold" });
        break;
    }
    const separator = SeparatorContentFactory.create("sm");
    subjectContent.addContent(subject.textContent);
    subjectContent.addContent(separator);

    return subjectContent.boxContent;
  }

  /**
   * 決済通知メッセージの決済情報部分を作成する
   * @param paymentHistoryList
   * @returns 決済情報部分を表示するメッセージオブジェクト
   */
  buildPaymentMessage(paymentHistoryList: PaymentHistoryList): FlexBox {
    // メッセージ履歴レコード部分
    const paymentRecordsContent = BoxContentFactory.create({ layout: "vertical" });
    for (const paymentHistory of paymentHistoryList.paymentHistoryList) {
      paymentRecordsContent.addContent(this.buildPaymentMessageRecord(paymentHistory));
    }

    // 合計金額
    const totalAmountRecordContent = this.buildTotalAmountRecord(paymentHistoryList);
    paymentRecordsContent.addContent(totalAmountRecordContent);

    return paymentRecordsContent.boxContent;
  }

  /**
   * 決済情報の 1 レコード部分を作成する
   * @param paymentHistory
   * @returns 決済情報の1 レコードを表示するッセージオブジェクト
   */
  buildPaymentMessageRecord(paymentHistory: PaymentHistory): FlexBox {
    const paymentRecordContent = BoxContentFactory.create({ layout: "horizontal", margin: "xs", justifyContent: "flex-start" });

    const date = TextContentFactory.create({
      text: paymentHistory.date,
      flex: 3
    });
    const store = TextContentFactory.create({
      text: paymentHistory.store,
      flex: 3
    });
    const amount = TextContentFactory.create({
      text: paymentHistory.amount,
      align: "end",
      flex: 3,
      margin: "none"
    });

    paymentRecordContent.addContent(date.textContent);
    paymentRecordContent.addContent(store.textContent);
    paymentRecordContent.addContent(amount.textContent);

    return paymentRecordContent.boxContent;
  }

  /**
   * トータル金額を表示するメッセージを作成する
   * @param paymentHistoryList 決済情報リスト
   * @param isAll true 全て、false 利用者毎
   * @returns 合計金額を表示するメッセージオブジェクト
   */
  buildTotalAmountRecord(paymentHistoryList: PaymentHistoryList, isAll: boolean = false): FlexBox {
    const totalAmountRecordContent = BoxContentFactory.create({
      layout: "horizontal",
      margin: "sm",
      justifyContent: "flex-start"
    });

    const totalAmount = paymentHistoryList.calcTotalAmount();
    const subjectText = isAll ? "合計" : "計";

    const totalSubject = TextContentFactory.create({
      text: subjectText,
      align: "end",
      flex: 4
    });

    const totalAmountContent = TextContentFactory.create({
      text: `${totalAmount.toLocaleString()} 円`,
      align: "end",
      flex: 2
    });

    totalAmountRecordContent.addContent(totalSubject.textContent);
    totalAmountRecordContent.addContent(totalAmountContent.textContent);

    return totalAmountRecordContent.boxContent;
  }
}
