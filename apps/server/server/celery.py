# Create a Celery instance
from celery import Celery


celery = Celery(
    "visualdynamics",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1",
)

celery.conf.update(result_extended=True)

# Configure the Celery instance
# celery.conf.task_routes = {"server.tasks.*": {"queue": "server"}}
