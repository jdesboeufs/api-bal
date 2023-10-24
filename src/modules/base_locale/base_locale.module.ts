import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NumeroService } from '@/modules/numeros/numero.service';
import { BaseLocaleController } from './base_locale.controller';
import { BaseLocaleMiddleware } from '@/lib/middlewares/base_locale.middleware';
import { DbModelFactory } from '@/lib/model_factory/db.model.factory';
import { BaseLocaleService } from './base_locale.service';

@Module({
  imports: [MongooseModule.forFeatureAsync(DbModelFactory)],
  providers: [NumeroService, BaseLocaleMiddleware, BaseLocaleService],
  controllers: [BaseLocaleController],
})
export class BaseLocaleModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BaseLocaleMiddleware).forRoutes(BaseLocaleController);
  }
}