from sqlmodel import create_engine, SQLModel, Session
import os

# Строка подключения (Data Source Name - DSN)
# Мы берем данные, которые прописали в docker-compose.yml
DATABASE_URL = "postgresql://user:password@localhost:5432/quotes_db"

# Engine — это точка входа для общения с базой. 
# echo=True заставит Python печатать все SQL-команды в консоль (удобно для обучения)
engine = create_engine(DATABASE_URL, echo=True)

# Функция для автоматического создания всех таблиц, описанных в models.py
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Генератор сессий. Сессия — это транзакция (один сеанс связи с базой)
def get_session():
    with Session(engine) as session:
        yield session