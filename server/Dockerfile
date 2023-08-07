FROM python:3.11-alpine as base

WORKDIR /var/www/server

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt .

FROM base as deps

RUN pip install -r requirements.txt

FROM deps as runner

COPY . .