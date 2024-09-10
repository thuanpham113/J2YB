from abc import ABC, abstractmethod
from enum import Enum

# Định nghĩa vai trò người dùng
class Role(Enum):
    ADMIN = 'Admin'
    CONTRIBUTOR = 'Contributor'
    READER = 'Reader'

# Định nghĩa giao diện lớp quản lý thư mục và tệp
class PermissionInterface(ABC):

    @abstractmethod
    def grant_permission(self, user, role):
        pass

    @abstractmethod
    def check_permission(self, user, role):
        pass