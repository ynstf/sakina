run:
	python manage.py runserver 0.0.0.0:8000

migrate:
	python manage.py makemigrations && python manage.py migrate

create_admin:
	python manage.py createsuperuser

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

migrate_docker:
	docker compose exec web python manage.py makemigrations
	docker compose exec web python manage.py migrate

create_admin_docker:
	docker compose exec web python manage.py createsuperuser

logs_docker:
	docker compose logs -f web