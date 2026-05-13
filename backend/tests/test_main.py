import os
from app.models import Author, Quote

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "mysecret123")

def test_read_main(client):
    """Проверка доступности API"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API is working"}

def test_create_author_forbidden(client):
    """Проверка, что без токена автора создать нельзя (403)"""
    response = client.post("/authors/", json={"name": "Test", "bio": "Test"})
    assert response.status_code == 403

def test_create_author_success(client):
    """Проверка успешного создания автора с токеном"""
    headers = {"X-Admin-Token": ADMIN_TOKEN}
    response = client.post(
        "/authors/", 
        json={"name": "Марк Аврелий", "bio": "Император"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Марк Аврелий"
    assert "id" in data

def test_get_random_quote_empty(client):
    """Проверка 404, если цитат еще нет"""
    response = client.get("/quotes/random")
    assert response.status_code == 404
    assert response.json()["detail"] == "В базе пока нет цитат"

def test_search_quotes(client, session):
    """Комплексный тест: создаем данные и ищем их"""
    #1 Создам автора напрямую через сессию
    from app.models import Author, Quote
    author = Author(name="Джейсон", bio="Актер")
    session.add(author)
    session.commit()
    
    #2 Создам цитату
    quote = Quote(text="Проверка поиска", author_id=author.id)
    session.add(quote)
    session.commit()
    
    #3 Выполняет поиск через API
    response = client.get("/quotes/search?query=Проверка")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["author"] == "Джейсон"

