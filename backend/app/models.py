from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class Author(SQLModel, table=True):
    '''Класс Author — это описание таблицы авторов в БД'''
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # index=True ускоряет поиск по именам авторов
    name: str = Field(index=True)
    
    # Optional означает, что поле может быть пустым (NULL в базе)
    bio: Optional[str] = None

    # Relationship связывает автора с его цитатами (один автор -> много цитат)
    quotes: List["Quote"] = Relationship(back_populates="author")

class Quote(SQLModel, table=True):
    '''Класс Quote — описание таблицы цитат'''
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    category: str = Field(default="General")
    
    author_id: int = Field(foreign_key="author.id")
    
    # Позволяет обращаться к объекту автора прямо из цитаты (quote.author.name)
    author: Optional[Author] = Relationship(back_populates="quotes")
    