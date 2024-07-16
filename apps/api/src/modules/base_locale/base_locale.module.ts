import {
  Module,
  MiddlewareConsumer,
  forwardRef,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BaseLocaleController } from '@/modules/base_locale/base_locale.controller';
import { BaseLocaleMiddleware } from '@/modules/base_locale/base_locale.middleware';
import { BaseLocaleService } from '@/modules/base_locale/base_locale.service';
import { MailerModule } from '@/shared/modules/mailer/mailer.module';
import { PublicationModule } from '@/shared/modules/publication/publication.module';
import { SearchQueryPipe } from './pipe/search_query.pipe';

import { HabilitationModule } from '@/modules/base_locale/sub_modules/habilitation/habilitation.module';
import { ExportCsvModule } from '@/modules/base_locale/sub_modules/export_csv/export_csv.module';
import { TilesModule } from '@/modules/base_locale/sub_modules/tiles/tiles.module';
import { NumeroModule } from '@/modules/numeros/numero.module';
import { VoieModule } from '@/modules/voie/voie.module';
import { ToponymeModule } from '@/modules/toponyme/toponyme.module';
import { CommuneModule } from './sub_modules/commune/commune.module';
import { PopulateModule } from './sub_modules/populate/populate.module';
import { BaseLocale } from '@/shared/entities/base_locale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BaseLocale]),
    MailerModule,
    PublicationModule,
    forwardRef(() => HabilitationModule),
    forwardRef(() => ExportCsvModule),
    forwardRef(() => TilesModule),
    forwardRef(() => NumeroModule),
    forwardRef(() => VoieModule),
    forwardRef(() => ToponymeModule),
    forwardRef(() => CommuneModule),
    forwardRef(() => PopulateModule),
  ],
  providers: [BaseLocaleMiddleware, BaseLocaleService, SearchQueryPipe],
  controllers: [BaseLocaleController],
  exports: [BaseLocaleService],
})
export class BaseLocaleModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BaseLocaleMiddleware)
      .exclude({ path: 'bases-locales/search', method: RequestMethod.GET })
      .forRoutes(BaseLocaleController);
  }
}
