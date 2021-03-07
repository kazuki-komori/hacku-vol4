from typing import Tuple


class LendingService:
    """ 貸出機能の処理系
    """

    def __init__(self, token):
        self.token = token

    def register_lending(self, content: str, deadline: str) -> Tuple[int, str]:
        """ 貸出情報の登録
        Parameters
        ----------
        content: str
            貸出内容
        deadline: str
            返却日

        Returns
        -------
        lendingId: int
            貸出ID
        created_at: str
            登録時間
        """
        return 1, "2020/1/1"

    def register_borrower(self, lending_id: int) -> Tuple[str, str, str]:
        """ 借りた人の登録
        Parameters
        ----------
        lending_id: int
            貸出ID

        Returns
        -------
        content: str
            貸出内容
        deadline: str
            返却日
        ownerName: str
            貸した人の名前
        """
        return "貸出内容", "返却日", "貸した人の名前"

    def get_owner_lending(self) -> list:
        """ 貸したもの一覧
        Returns
        -------
        lendingList: list
            lendingId: str
                貸出ID
            content: str
                貸出内容
            deadline: str
                返却日
            borrowerName: str
                借りた人の名前
        """
        return [{
                    'lendingId': "貸出id",
                    'content': "貸したもの",
                    'deadline': "期限",
                    'borrowerName': "借りた人の名前"
                }]

    def get_borrower_lending(self) -> list:
        """ 借りたもの一覧
       Returns
       -------
       lendingList: list
           lendingId: str
               貸出ID
           content: str
               貸出内容
           deadline: str
               返却日
           borrowerName: str
               借りた人の名前
       """
        return [{
            'lendingId': "貸出id",
            'content': "貸したもの",
            'deadline': "期限",
            'borrowerName': "借りた人の名前"
        }]

    def register_lending_return(self):
        """ 返却報告
        Parameters
        ----------
        lending_id: int
            貸出ID

        Returns
        -------
        content: str
            貸出内容
        deadline: str
            返却日
        ownerName: str
            借りた人の名前
        """
        return "貸出内容", "返却日", "借りた人の名前"
