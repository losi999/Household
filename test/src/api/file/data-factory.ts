import { DataFactoryFunction } from '@household/shared/types/common';
import { File, Import } from '@household/shared/types/types';
import { FileType } from '@household/shared/enums';
import { faker } from '@faker-js/faker';
import { utils, WorkSheet, write } from 'xlsx';
import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';
import { createId } from '@household/test/api/utils';
import { default as moment } from 'moment-timezone';

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
      'Started Date': moment.tz('Europe/Budapest').toDate(),
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

  const createRevolutFile = (...input: Partial<Import.Revolut>[]): File<Import.Revolut> => {
    const rows = input.length > 0 ? input.map(r => createRevolutRow(r)) : [createRevolutRow()];

    const worksheet = utils.json_to_sheet(rows);

    return {
      file: toExcelFile(worksheet, 'Sheet1'),
      rows,
    };
  };

  const createOtpRow: DataFactoryFunction<Import.Otp> = (row) => {
    return {
      Összeg: faker.number.float(),
      'Tranzakció időpontja': moment.tz('Europe/Budapest').toDate(),
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

  const createOtpFile = (...input: Partial<Import.Otp>[]): File<Import.Otp> => {
    const rows = input.length > 0 ? input.map(r => createOtpRow(r)) : [createOtpRow()];

    const worksheet = utils.json_to_sheet(rows);

    return {
      file: toExcelFile(worksheet, 'Sheet3'),
      rows,
    };
  };

  const createErsteRow: DataFactoryFunction<Import.Erste> = (row) => {
    return {
      Összeg: faker.number.float(),
      'Tranzakció dátuma és ideje': undefined,
      Dátum: moment.tz('Europe/Budapest').toDate(),
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

  const createErsteFile = (...input: Partial<Import.Erste>[]): File<Import.Erste> => {
    const rows = input.length > 0 ? input.map(r => createErsteRow(r)) : [createErsteRow()];
    const headers = Object.keys(rows[0]) as (keyof Import.Erste)[];
    const aoa = [
      [],
      [],
      [],
      headers,
      ...rows.map(r => headers.map(h => r[h])),
    ];

    const worksheet = utils.aoa_to_sheet(aoa);

    return {
      file: toExcelFile(worksheet, 'Sheet0'),
      rows,
    };
  };

  const createFileDocument: DataFactoryFunction<File.Request, File.Document> = (req) => {
    return fileDocumentConverter.create(createFileRequest(req), Cypress.env('EXPIRES_IN'), true);
  };

  return {
    id: (createId<File.Id>),
    request: createFileRequest,
    document: createFileDocument,
    revolutFile: createRevolutFile,
    otpFile: createOtpFile,
    ersteFile: createErsteFile,
  };
})();
