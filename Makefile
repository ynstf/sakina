run:
	python manage.py runserver

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

venv: 
	env\Scripts\activate

no-venv: 
	env\Scripts\deactivate