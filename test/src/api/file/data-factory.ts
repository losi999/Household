import { DataFactoryFunction } from '@household/shared/types/common';
import { File, Import } from '@household/shared/types/types';
import { FileType } from '@household/shared/enums';
import { faker } from '@faker-js/faker';
import { utils, write, read } from 'xlsx';
import { default as moment } from 'moment-timezone';
import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';
import { createId } from '@household/test/api/utils';

export const fileDataFactory = (() => {
  const createFileRequest: DataFactoryFunction<File.Request> = (req) => {
    return {
      fileType: FileType.Revolut,
      timezone: 'Europe/Budapest',
      ...req,
    };
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
      Type: faker.word.words(1),
      ...row,
    };
  };

  const createRevolutFile = (...rows: Import.Revolut[]) => {
    const worksheet = utils.json_to_sheet(rows);
    console.log('pre', rows[0]['Started Date']);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const data = write(workbook, {
      type: 'array',
      bookType: 'xlsx',
      cellDates: true,
    });

    // writeFile(workbook, 'file.xlsx');

    console.log(data);

    const parsed = utils.sheet_to_json<Import.Revolut>(read(data, {
      type: 'array',
      cellDates: true,
    }).Sheets.Sheet1);
    console.log(parsed);
    console.log(moment(parsed[0]['Started Date']).toISOString());

    return data;
  };

  const createFileDocument: DataFactoryFunction<File.Request, File.Document> = (req) => {
    return fileDocumentConverter.create(createFileRequest(req), Cypress.env('EXPIRES_IN'), true);
  };

  return {
    id: (createId<File.Id>),
    request: createFileRequest,
    document: createFileDocument,
    revolutRow: createRevolutRow,
    revolutFile: createRevolutFile,
  };
})();
