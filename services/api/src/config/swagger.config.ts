import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwaggerDocument() {
  return new DocumentBuilder()
    .setTitle('HealthIA API')
    .setDescription('Main API for users, authentication and AI orchestration.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
}

export function configureSwagger(app: INestApplication): void {
  const config = configureSwaggerDocument();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
