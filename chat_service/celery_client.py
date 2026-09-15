import os
from celery import Celery

# URL dyal RabbitMQ (localhost l-test, wla smit l-container f Docker)
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672//")

# Initialisation dyal Celery Producer
celery_app = Celery(
    "sakina_tasks",
    broker=RABBITMQ_URL
)

# Configuration bach y-khdm bzaf m3a JSON
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Africa/Casablanca',
    enable_utc=True,
)