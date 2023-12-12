import { extractFromCsv } from '@/lib/utils/csv.utils';
import { ApiDepotService } from '@/shared/modules/api_depot/api_depot.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PopulateService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private apiDepotService: ApiDepotService,
  ) {}

  private async extractFromApiDepot(codeCommune: string) {
    try {
      const response =
        await this.apiDepotService.downloadCurrentRevisionFile(codeCommune);

      const result = await extractFromCsv(response.data, codeCommune);

      if (!result.isValid) {
        throw new Error('Invalid CSV file');
      }

      return result;
    } catch {}
  }

  private async extractFromBAN(codeCommune: string) {
    try {
      const banApiUrl = this.configService.get<string>('BAN_API_URL');
      const balFileData = `${banApiUrl}/ban/communes/${codeCommune}/download/csv-bal/adresses`;

      const response = await this.httpService.axiosRef({
        url: balFileData,
        method: 'GET',
        responseType: 'arraybuffer',
      });

      const result = await extractFromCsv(response.data, codeCommune);

      if (!result.isValid) {
        throw new Error('Invalid CSV file');
      }

      return result;
    } catch {}
  }

  public async extract(codeCommune: string) {
    const fromApiDepot = await this.extractFromApiDepot(codeCommune);
    const fromBan = await this.extractFromBAN(codeCommune);

    const result = fromApiDepot || fromBan;

    if (result) {
      return result;
    }

    console.error(
      `Aucune adresse n’a pu être extraite avec le code commune: ${codeCommune}`,
    );

    return { voies: [], numeros: [], toponymes: [] };
  }
}
