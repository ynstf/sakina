install:
	pip install -r requirements.txt

freeze:
	pip freeze > requirements.txt

requirements:
	pip list

test:
	pytest