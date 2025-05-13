import { DataFactoryFunction } from '@household/shared/types/common';
import { File, Import } from '@household/shared/types/types';
import { FileType } from '@household/shared/enums';
import { faker } from '@faker-js/faker';
import { utils, WorkSheet, write } from 'xlsx';
import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';
import { createId } from '@household/test/api/utils';
import { default as moment } from 'moment-timezone';
import { addSeconds } from '@household/shared/common/utils';

type File<R> = {
  rows: R[];
  file: any;
};

export const fileDataFactory = (() => {
  const createFileRequest: DataFactoryFunction<File.Request> = (req) => {
    return {
      fileType: FileType.Revolut,
      timezone: 'Europe/Budapest',
      ...req,
    };
  };

  const toExcelFile = (worksheet: WorkSheet, sheetName: string) => {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, sheetName);

    return write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      cellDates: true,
    });
  };

  const createRevolutRow: DataFactoryFunction<Import.Revolut> = (row) => {
    return {
      'Started Date': new Date(),
      Amount: faker.number.float(),
      Currency: faker.finance.currencyCode(),
      Description: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      Fee: faker.number.float({
        min: 0,
        max: 2,
      }),
      Type: faker.string.uuid(),
      ...row,
    };
  };

  const createRevolutFile = (timezone: string, input: Partial<Import.Revolut>[]): unknown => {
    const diff = moment().tz(timezone)
      .utcOffset() - moment().utcOffset();

    const rows = input.map(r => {
      return {
        ...createRevolutRow(r),
        'Started Date': addSeconds(diff * 60, r['Started Date']),
      };
    });

    const worksheet = utils.json_to_sheet(rows);

    return toExcelFile(worksheet, 'Sheet1');
  };

  const createOtpRow: DataFactoryFunction<Import.Otp> = (row) => {
    return {
      Összeg: faker.number.float(),
      'Tranzakció időpontja': new Date(),
      'Ellenoldali név': faker.company.name(),
      Közlemény: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      'Forgalom típusa': faker.string.uuid(),
      ...row,
    };
  };

  const createOtpFile = (timezone: string, input: Partial<Import.Otp>[]): unknown => {
    const diff = moment().tz(timezone)
      .utcOffset() - moment().utcOffset();

    const rows = input.map(r => {
      return {
        ...createOtpRow(r),
        'Tranzakció időpontja': addSeconds(diff * 60, r['Tranzakció időpontja']),
      };
    });

    const worksheet = utils.json_to_sheet(rows);

    return toExcelFile(worksheet, 'Sheet3');
  };

  const createErsteRow: DataFactoryFunction<Import.Erste> = (row) => {
    return {
      Összeg: faker.number.float(),
      'Tranzakció dátuma és ideje': undefined,
      Dátum: new Date(),
      'Partner név': faker.company.name(),
      Közlemény: faker.word.words({
        count: {
          min: 1,
          max: 5,
        },
      }),
      Kategória: faker.string.uuid(),
      ...row,
    };
  };

  const createErsteFile = (timezone: string, input: Partial<Import.Erste>[]): unknown => {
    const diff = moment().tz(timezone)
      .utcOffset() - moment().utcOffset();

    const rows = input.map(r => {
      return {
        ...createErsteRow(r),
        Dátum: addSeconds(diff * 60, r.Dátum),
      };
    });

    const headers = Object.keys(rows[0]) as (keyof Import.Erste)[];
    const aoa = [
      [],
      [],
      [],
      headers,
      ...rows.map(r => headers.map(h => r[h])),
    ];

    const worksheet = utils.aoa_to_sheet(aoa);

    return toExcelFile(worksheet, 'Sheet0');
  };

  const createFileDocument: DataFactoryFunction<File.Request, File.Document> = (req) => {
    return fileDocumentConverter.create(createFileRequest(req), Cypress.env('EXPIRES_IN'), true);
  };

  return {
    id: (createId<File.Id>),
    request: createFileRequest,
    document: createFileDocument,
    revolut: {
      row: createRevolutRow,
      file: createRevolutFile,
    },
    otp: {
      row: createOtpRow,
      file: createOtpFile,
    },
    erste: {
      row: createErsteRow,
      file: createErsteFile,
    },
  };
})();
