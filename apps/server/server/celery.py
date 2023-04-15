# Create a Celery instance
from celery import Celery


celery = Celery(
    "visualdynamics",
    broker="redis://localhost:6379",
)

# Configure the Celery instance
# celery.conf.task_routes = {"server.tasks.*": {"queue": "server"}}
