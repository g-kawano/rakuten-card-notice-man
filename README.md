# rakuten-card-notice-man
楽天カードの使用履歴を LINE に通知する Bot

# 概要
Google Apps Script(GAS) で[カード利用お知らせメール](https://www.rakuten-card.co.jp/security/information-mail/)を抽出し、メール本文の内容を基に、楽天カードの使用履歴を LINE のグループトークに通知します。
使用履歴は 当該実行アカウントの Google SpredSheet にも保存します。
