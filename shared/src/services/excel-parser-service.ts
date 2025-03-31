import { File, Transaction } from '@household/shared/types/types';
import { read as Read, utils as Utils, WorkBook } from 'xlsx';
import { default as Moment } from 'moment-timezone';

export interface IExcelParserService {
  parse(fileContent: Uint8Array, fileType: File.Type['fileType'], timezone: string): (Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description)[];
}

export const excelParserServiceFactory = (read: typeof Read, utils: typeof Utils, moment: typeof Moment): IExcelParserService => {
  const parseOtpExcel = (workbook: WorkBook): (Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description)[] => {
    const parsed = utils.sheet_to_json<any>(workbook.Sheets.Sheet3);

    return parsed.map((p => {
      return {
        amount: p['Összeg'],
        description: `${p['Forgalom típusa']} ${p['Ellenoldali név']} ${p['Közlemény']}`,
        issuedAt: moment((p['Tranzakció időpontja'] as Date).toISOString().replace('Z', '')).toDate(),
      };
    }));
  };

  const parseRevolutExcel = (workbook: WorkBook): (Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description)[] => {
    const parsed = utils.sheet_to_json<any>(workbook.Sheets.Sheet1);

    return parsed.map((p => {
      return {
        amount: p['Amount'] - p['Fee'],
        description: p['Description'],
        issuedAt: moment((p['Started Date'] as Date).toISOString().replace('Z', '')).toDate(),
      };
    }));
  };

  const parseErsteExcel = (workbook: WorkBook): (Transaction.IssuedAt<Date> & Transaction.Amount & Transaction.Description)[] => {
    const parsed = utils.sheet_to_json<any>(workbook.Sheets.Sheet0, {
      range: 3,
    });

    return parsed.map((p => {

      const date = p['Tranzakció dátuma és ideje'] ? moment(p['Tranzakció dátuma és ideje'], 'YYYY.MM.DD HH:mm:ss').toDate() : moment((p['Dátum'] as Date).toISOString().replace('Z', '')).toDate();
      console.log(date);
      return {
        amount: p['Összeg'],
        description: `${p['Partner név']} ${p['Közlemény']}`,
        issuedAt: date,
      };
    }));
  };

  const instance: IExcelParserService = {
    parse: (fileContent, fileType, timezone) => {
      const excel = read(fileContent, {
        type: 'array',
        cellDates: true,
      });

      moment.tz.setDefault(timezone);

      switch(fileType) {
        case 'otp': {
          return parseOtpExcel(excel);
        }
        case 'erste': {
          return parseErsteExcel(excel);
        }
        case 'revolut': {
          return parseRevolutExcel(excel);
        }
      }
    },
  };

  return instance;
};
