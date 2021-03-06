from src.domain.repository import FriendRepository


class FriendUseCase:
    def __init__(self, repository: FriendRepository):
        self.repository = repository

    def register_friend(self, user_id_1: str, user_id_2: str) -> [str, str]:
        """
        フレンド登録をする

        Parameters
        ----------
        user_id_1: str
            ユーザー2とフレンド登録されるユーザー1のid
        user_id_2: str
            ユーザー1とフレンド登録されるユーザー2のid
        """
        return self.repository.register_friend(user_id_1, user_id_2)

    def unregister_friend(self, user_id_1: str, user_id_2: str) -> [str, str]:
        """
        フレンド登録を解除する

        Parameters
        ----------
        user_id_1: str
            ユーザー2とのフレンド登録を解除されるユーザー1のid
        user_id_2: str
            ユーザー1とのフレンド登録を解除されるユーザー2のid
        """
        return self.unregister_friend(user_id_1, user_id_2)

    def __repr__(self):
        return f'FriendUseCase("{self.repository}")'
