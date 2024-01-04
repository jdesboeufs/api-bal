import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import { groupBy, mapValues } from 'lodash';
import { format } from 'date-fns';

import { BaseLocale } from '@/shared/schemas/base_locale/base_locale.schema';
import { StatusBaseLocalEnum } from '@/shared/schemas/base_locale/status.enum';

import { BaseLocaleService } from '@/modules/base_locale/base_locale.service';
import { BasesLocalesStatusDTO } from '@/modules/stats/dto/bases_locales_status.dto';
import { BasesLocalesCreationDTO } from '@/modules/stats/dto/bases_locales_creations.dto';

@Injectable()
export class StatsService {
  constructor(
    @Inject(forwardRef(() => BaseLocaleService))
    private baseLocaleService: BaseLocaleService,
  ) {}

  public async findBalInCodeCommuneWithFields(
    fields: string[] = [],
    codeCommunes: string[] = [],
  ): Promise<BaseLocale[]> {
    const filters: FilterQuery<BaseLocale> = {
      status: { $ne: 'demo' },
      _deleted: null,
      ...(codeCommunes && { commune: { $in: codeCommunes } }),
    };
    let selector: Record<string, number> = null;
    if (fields.length > 0) {
      selector = {};
      fields.forEach((f) => {
        selector[f] = 1;
      });
    }
    return this.baseLocaleService.findMany(filters, selector);
  }

  public async findBalsStatusRepartition(): Promise<BasesLocalesStatusDTO[]> {
    const aggregation: PipelineStage[] = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    const statusRepartition: { _id: Types.ObjectId; count: number }[] =
      await this.baseLocaleService.aggregate(aggregation);

    return statusRepartition.map(({ _id, count }) => ({ status: _id, count }));
  }

  public async findBalsCreationByDays(dates: {
    from: Date;
    to: Date;
  }): Promise<BasesLocalesCreationDTO[]> {
    const filter: FilterQuery<BaseLocale> = {
      _created: {
        $gte: dates.from,
        $lte: dates.to,
      },
    };
    const bals = await this.baseLocaleService.findMany(filter);
    const balsGroupByDays: Record<string, BaseLocale> = groupBy(bals, (bal) =>
      format(bal._created, 'yyyy-MM-dd'),
    );
    return Object.entries(balsGroupByDays).map(([date, bals]) => {
      const balsGroupedByCommune = groupBy(bals, (bal) => bal.commune);
      return {
        date,
        createdBAL: mapValues(balsGroupedByCommune, (balsByCommune) => ({
          total: balsByCommune.length,
          published: balsByCommune.filter(
            ({ status }) => status === StatusBaseLocalEnum.PUBLISHED,
          ).length,
          draft: balsByCommune.filter(
            ({ status }) => status === StatusBaseLocalEnum.DRAFT,
          ).length,
          readyToPublish: 0,
          demo: balsByCommune.filter(({ status }) => status === 'demo').length,
        })),
      };
    });
  }
}
