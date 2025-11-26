from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class Hash:
    @staticmethod
    def hash(password: str):
        password = password[:72]
        return pwd_context.hash(password)

    @staticmethod
    def verify(hashed_password: str, plain_password: str):
        plain_password = plain_password[:72]
        return pwd_context.verify(plain_password, hashed_password)
