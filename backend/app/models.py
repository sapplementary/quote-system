from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

'''Класс Author — это описание таблицы авторов в БД'''
class Author(SQLModel, table=True):
    # primary_key=True делает это поле уникальным идентификатором (ID)
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # index=True ускоряет поиск по именам авторов
    name: str = Field(index=True)
    
    # Optional означает, что поле может быть пустым (NULL в базе)
    bio: Optional[str] = None

    # Relationship связывает автора с его цитатами (один автор -> много цитат)
    quotes: List["Quote"] = Relationship(back_populates="author")


'''Класс Quote — описание таблицы цитат'''
class Quote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    category: str = Field(default="General")
    
    # foreign_key связывает цитату с конкретным ID автора
    author_id: int = Field(foreign_key="author.id")
    
    # Позволяет обращаться к объекту автора прямо из цитаты (quote.author.name)
    author: Optional[Author] = Relationship(back_populates="quotes")
    
