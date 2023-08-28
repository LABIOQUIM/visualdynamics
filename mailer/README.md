
# Simple Mail Ts

**Simple Mail Ts** is an editable microservice in nestJs where you can insert your handlebars template and send emails with queue control with support from Bull.


## Installation and Build

The Installation process is simple. You need to fill in the data of your .env file in place of the .env.example, inserting your SMTP information (Compatibility with GMAIL and others), the access information of your redis container and also a configuration for your Bull dashboard.
### Configurações de Templates e Contexto

First of all, you need to modify your templates in the `Templates` folder.
After modifying and adding your handlebars file, it's only necessary to modify the context being sent in `src/producers/mail/jobs/sendMail-consumer.ts` so that you can set the same for your handlebars file.

Also remember to modify `src/controllers/send-email/send-mail-dto.ts` to type the necessary context.


### Environment variables

To run this project, you will need to add the following environment variables to your .env
#### SMTP data

`SMTP_USER`

`SMTP_PASS`

`SMTP_PORT`

`SMTP_HOST`

#### Data from Redis

`REDIS_PASSWORD`

`REDIS_PORT`

`REDIS_HOST`

#### Data for dashboard access

`DASHBOARD_USERNAME`

`DASHBOARD_PASSWORD`

#### Docker compose configuration

Below is an example configuration of docker-compose.yml, I recommend modifying the ports.

```YML
version: '3.8'
services:
  cache:
    image: redis:6.2-alpine
    restart: always
    ports:
      - '6379:6379'
    command: redis-server --save 20 1 --requirepass your-pass-here
    volumes: 
      - cache:/data
  simple-mail:
    build: .
    restart: always
    ports:
      - '3002:3000'
    env_file: .env
    volumes:
      - simple-mail:/data
volumes:
  cache:
    driver: local
  simple-mail:
    driver: local
```

### Build

To build and run the system, you only need one:

```
docker compose up -d --build
```

    
## Demonstration

To use the email service after it has been configured, you can test it by accessing host:3000/admin/bull and inserting your credentials, if you have access to the queue everything is fine.

### Request for use

Example:

Make a POST Request to http://localhost:3000/send-email
```json
{
  "to":"mail@gmail.com",
  "from":"mail@noreply.com.br",
  "subject":"Test",
  "context":{
    "name":"Jarvan Five"
  }
}
```

