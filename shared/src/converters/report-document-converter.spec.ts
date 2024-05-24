import { createAccountId, createCategoryId, createProjectId, createRecipientId, createProductId } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { reportDocumentConverterFactory, IReportDocumentConverter } from '@household/shared/converters/report-document-converter';
import { advanceTo, clear } from 'jest-date-mock';
import { Types } from 'mongoose';

describe('Report document converter', () => {
  let converter: IReportDocumentConverter;

  beforeEach(() => {
    converter = reportDocumentConverterFactory();
  });

  // afterEach(() => {
  //   clear();
  // });

  // const name = 'Bolt';
  // const expiresIn = 3600;

  // const body = createReportRequest({
  //   name,
  // });
  // const queriedDocument = createReportDocument({
  //   name,
  //   createdAt: now,
  //   updatedAt: now,
  // });

  describe('createFilterQuery', () => {
    it('should create full objects', () => {
      const includedAccount = createAccountId();
      const excludedAccount = createAccountId();
      const includedCategory = createCategoryId();
      const excludedCategory = createCategoryId();
      const includedProduct = createProductId();
      const excludedProduct = createProductId();
      const includedProject = createProjectId();
      const excludedProject = createProjectId();
      const includedRecipient = createRecipientId();
      const excludedRecipient = createRecipientId();
      const fromDateA = new Date(2024, 1, 1, 0, 0, 0).toISOString();
      const fromDateB = new Date(2023, 1, 1, 0, 0, 0).toISOString();
      const fromDateC = new Date(2024, 5, 1, 0, 0, 0).toISOString();
      const toDateA = new Date(2024, 3, 1, 0, 0, 0).toISOString();
      const toDateB = new Date(2024, 4, 1, 0, 0, 0).toISOString();
      const toDateC = new Date(2025, 1, 1, 0, 0, 0).toISOString();

      const result = converter.createFilterQuery([
        {
          filterType: 'account',
          items: [includedAccount],
          exclude: false,
        },
        {
          filterType: 'account',
          items: [excludedAccount],
          exclude: true,
        },
        {
          filterType: 'category',
          items: [includedCategory],
          exclude: false,
        },
        {
          filterType: 'category',
          items: [excludedCategory],
          exclude: true,
        },
        {
          filterType: 'project',
          items: [includedProject],
          exclude: false,
        },
        {
          filterType: 'project',
          items: [excludedProject],
          exclude: true,
        },
        {
          filterType: 'product',
          items: [includedProduct],
          exclude: false,
        },
        {
          filterType: 'product',
          items: [excludedProduct],
          exclude: true,
        },
        {
          filterType: 'recipient',
          items: [includedRecipient],
          exclude: false,
        },
        {
          filterType: 'recipient',
          items: [excludedRecipient],
          exclude: true,
        },
        {
          filterType: 'issuedAt',
          exclude: false,
          from: fromDateA,
          to: toDateA,
        },
        {
          filterType: 'issuedAt',
          exclude: false,
          from: fromDateB,
          to: undefined,
        },
        {
          filterType: 'issuedAt',
          exclude: false,
          from: undefined,
          to: toDateB,
        },
        {
          filterType: 'issuedAt',
          exclude: true,
          from: fromDateC,
          to: toDateC,
        },
      ]);

      expect(result).toEqual([
        {
          $match: {
            $and: [
              {
                transactionType: {
                  $ne: 'transfer',
                },
              },
              {
                account: {
                  $in: [new Types.ObjectId(includedAccount)],
                },
              },
              {
                account: {
                  $nin: [new Types.ObjectId(excludedAccount)],
                },
              },

              {
                recipient: {
                  $in: [new Types.ObjectId(includedRecipient)],
                },
              },
              {
                recipient: {
                  $nin: [new Types.ObjectId(excludedRecipient)],
                },
              },
              {
                $or: [
                  {
                    issuedAt: {
                      $gte: new Date(fromDateA),
                      $lte: new Date(toDateA),
                    },
                  },
                  {
                    issuedAt: {
                      $gte: new Date(fromDateB),
                    },
                  },
                  {
                    issuedAt: {
                      $lte: new Date(toDateB),
                    },
                  },
                  {
                    issuedAt: {
                      $lt: new Date(fromDateC),
                      $gt: new Date(toDateC),
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $match: {
            $and: [
              {
                category: {
                  $in: [new Types.ObjectId(includedCategory)],
                },
              },
              {
                category: {
                  $nin: [new Types.ObjectId(excludedCategory)],
                },
              },
              {
                project: {
                  $in: [new Types.ObjectId(includedProject)],
                },
              },
              {
                project: {
                  $nin: [new Types.ObjectId(excludedProject)],
                },
              },
              {
                product: {
                  $in: [new Types.ObjectId(includedProduct)],
                },
              },
              {
                product: {
                  $nin: [new Types.ObjectId(excludedProduct)],
                },
              },
            ],
          },
        },
      ]);
    });
  });

  // describe('create', () => {
  //   it('should return document', () => {
  //     const result = converter.create(body, undefined);
  //     expect(result).toEqual(createReportDocument({
  //       name,
  //       expiresAt: undefined,
  //       _id: undefined,
  //     }));
  //   });

  //   it('should return expiring document', () => {
  //     const result = converter.create(body, expiresIn);
  //     expect(result).toEqual(createReportDocument({
  //       name,
  //       expiresAt: addSeconds(expiresIn, now),
  //       _id: undefined,
  //     }));
  //   });

  // });

  // describe('update', () => {
  //   it('should update document', () => {
  //     const result = converter.update(body, expiresIn);
  //     expect(result).toEqual(createDocumentUpdate({
  //       $set: {
  //         ...body,
  //         expiresAt: addSeconds(expiresIn, now),
  //       },
  //     }));
  //   });
  // });

  // describe('toResponse', () => {
  //   it('should return response', () => {
  //     const result = converter.toResponse(queriedDocument);
  //     expect(result).toEqual(createReportResponse({
  //       reportId: getReportId(queriedDocument),
  //       name,
  //     }));
  //   });
  // });

  // describe('toResponseList', () => {
  //   it('should return response list', () => {
  //     const result = converter.toResponseList([queriedDocument]);
  //     expect(result).toEqual([
  //       createReportResponse({
  //         reportId: getReportId(queriedDocument),
  //         name,
  //       }),
  //     ]);
  //   });
  // });

  // describe('toReport', () => {
  //   it('should return report', () => {
  //     const result = converter.toReport(queriedDocument);
  //     expect(result).toEqual(createReportReport({
  //       reportId: getReportId(queriedDocument),
  //       name,
  //     }));
  //   });
  // });
});
