import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: {
      credentials: true,
      origin: process.env.APP_URL ?? "http://localhost:3000",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      allowedHeaders: "Content-Type, Authorization, Accept",
      exposedHeaders: "Content-Length",
    },
  });
  app.setGlobalPrefix("v1");

  const config = new DocumentBuilder()
    .setTitle("Visual Dynamics Simulation API")
    .setDescription("The Visual Dynamics Simulation API Documentation")
    .setVersion("0.1")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000);
}

bootstrap().then(() =>
  new Logger("NestApplication").log("API is running on http://localhost:3000"),
);
