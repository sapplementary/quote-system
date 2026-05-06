from typing import List, Optional
import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, or_, col
from sqlalchemy import func, text

from .database import engine, get_session, create_db_and_tables
from .models import Author, Quote

app = FastAPI(title="Quotes Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_admin_token(x_admin_token: str = Header(None)):
    correct_token = os.getenv("ADMIN_TOKEN")
    
    if x_admin_token != correct_token:
        raise HTTPException(
            status_code=403, 
            detail="Доступ запрещен: Неверный или отсутствующий API токен"
        )
    return True

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/quotes/random")
def get_random_quote(session: Session = Depends(get_session)):
    '''ЭНДПОИНТ: СЛУЧАЙНАЯ ЦИТАТА'''
    # 1. Формируем запрос: Выбрать Цитату, отсортировать случайно, взять 1 штуку
    statement = select(Quote).order_by(func.random()).limit(1) # type: ignore
    
    # 2. Выполняем запрос
    result = session.exec(statement).first()
    
    # 3. Если в базе вообще нет цитат — выдаем ошибку
    if not result:
        raise HTTPException(status_code=404, detail="В базе пока нет цитат")
    
    #4. Формируем ответ, включая имя автора
    #Благодаря Relationship в моделях, мы можем просто написать result.author.name
    return {
        "id": result.id,
        "text": result.text,
        "author": result.author.name,
        "category": result.category
    }


@app.get("/quotes/search")
def search_quotes(query: str, session: Session = Depends(get_session)):
    '''ЭНДПОИНТ: ПОИСК ЦИТАТ'''
    statement = (
        select(Quote)
        .join(Author)
        .where(
            or_(
                col(Quote.text).ilike(f"%{query}%"),
                col(Author.name).ilike(f"%{query}%")
            )
        )
    )
    
    # 1. Выполняем запрос
    results = session.exec(statement).all()
    
    # 2. Если ничего не нашли — возвращаем пустой список
    if not results:
        return []
    
    # 3. Преобразуем результаты в красивый список
    return [
        {
            "id": q.id,
            "text": q.text,
            "author": q.author.name,
            "category": q.category
        } for q in results
    ]

@app.post("/authors/", response_model=Author)
def create_author(
    author: Author, 
    session: Session = Depends(get_session), 
    _ = Depends(check_admin_token)
):
    '''ЭНДПОИНТЫ ДЛЯ АВТОРОВ'''
    # Добавляем объект автора в очередь на сохранение
    session.add(author)
    # Фиксируем изменения в базе данных (SQL COMMIT)
    session.commit()
    # Обновляем объект данными из базы
    session.refresh(author)
    return author


@app.get("/authors/", response_model=List[Author])
def read_authors(session: Session = Depends(get_session)):
    '''Получение списка всех авторов (GET запрос)'''
    # Формируем SQL-запрос: SELECT * FROM author
    statement = select(Author)
    # Выполняем запрос и получаем результаты
    authors = session.exec(statement).all()
    return authors

# Базовый эндпоинт
@app.get("/")
def read_root():
    return {"message": "Welcome to Quotes API"}


@app.post("/quotes/", response_model=Quote)
def create_quote(
    quote: Quote, 
    session: Session = Depends(get_session), 
    _ = Depends(check_admin_token) # Вот эта защита
):
    '''Создание цитаты (POST)'''
    db_author = session.get(Author, quote.author_id)
    if not db_author:
        # Если автора нет, возвращаем ошибку 404
        raise HTTPException(status_code=404, detail="Author not found")
    
    session.add(quote)
    session.commit()
    session.refresh(quote)
    return quote
    pass

@app.get("/quotes/", response_model=List[Quote])
def read_quotes(session: Session = Depends(get_session)):
    '''Получение списка всех цитат (GET)'''
    statement = select(Quote)
    quotes = session.exec(statement).all()
    return quotes

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
