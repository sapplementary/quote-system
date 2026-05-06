import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

# Строка подключения (Data Source Name - DSN)
# Беру данные, которые прописал в docker-compose.yml
DATABASE_URL = os.getenv("DATABASE_URL")

# Engine — точка входа для общения с базой 
# echo=True заставит Python печатать все SQL-команды в консоль
if not DATABASE_URL:
    raise ValueError("DATABASE_URL не задана в файле .env!")

engine = create_engine(DATABASE_URL, echo=True)

# Функция для автоматического создания всех таблиц, описанных в models.py
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Генератор сессий
def get_session():
    with Session(engine) as session:
        yield session
