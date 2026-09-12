run:
	uvicorn main:app --reload --port 8001

install:
	pip install -r requirements.txt

freeze:
	pip freeze > requirements.txt

requirements:
	pip list

test:
	pytest

up:
	docker compose up --build

down:
	docker compose down

logs_docker:
	docker compose logs -f web