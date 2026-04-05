from sqlmodel import create_engine, SQLModel, Session
import os
from dotenv import load_dotenv

load_dotenv()

# Строка подключения (Data Source Name - DSN)
# Мы берем данные, которые прописали в docker-compose.yml
DATABASE_URL = os.getenv("DATABASE_URL")

# Engine — это точка входа для общения с базой. 
# echo=True заставит Python печатать все SQL-команды в консоль (удобно для обучения)
if not DATABASE_URL:
    raise ValueError("DATABASE_URL не задана в файле .env!")

engine = create_engine(DATABASE_URL, echo=True)

# Функция для автоматического создания всех таблиц, описанных в models.py
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Генератор сессий. Сессия — это транзакция (один сеанс связи с базой)
def get_session():
    with Session(engine) as session:
        yield session