/**
 * GMail のメッセージクラス
 */
export class Message {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  /**
   * メール内容から正規表現で対象データを抽出する
   * @param prefix 抽出する情報の prefix 文字列
   */
  private extractPaymentInfo = (prefix: string): string => {
    const matched: RegExpMatchArray | null = this.message.match(`${prefix}.+`);
    return matched ? matched[0].replace(prefix, "") : "";
  };

  /**
   * 利用日を取得する
   */
  getUseDay(): string {
    return this.extractPaymentInfo("■利用日: ");
  }

  /**
   * 利用店舗を取得する
   */
  getUseStore(): string {
    return this.extractPaymentInfo("■利用先: ");
  }

  /**
   * 利用者を取得する
   */
  getUser(): string {
    return this.extractPaymentInfo("■利用者: ");
  }

  /**
   * 利用金額を取得する
   */
  getAmount(): string {
    return this.extractPaymentInfo("■利用金額: ");
  }
}
