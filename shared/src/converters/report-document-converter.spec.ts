import { createAccountId, createCategoryId, createProjectId, createRecipientId, createProductId } from '@household/shared/common/test-data-factory';
import { reportDocumentConverterFactory, IReportDocumentConverter } from '@household/shared/converters/report-document-converter';
import { Types } from 'mongoose';

describe('Report document converter', () => {
  let converter: IReportDocumentConverter;

  beforeEach(() => {
    converter = reportDocumentConverterFactory();
  });

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
      const date1 = new Date(2024, 1, 1, 1, 0, 0).toISOString();
      const date2 = new Date(2024, 1, 1, 2, 0, 0).toISOString();
      const date3 = new Date(2024, 1, 1, 3, 0, 0).toISOString();
      const date4 = new Date(2024, 1, 1, 4, 0, 0).toISOString();
      const date5 = new Date(2024, 1, 1, 5, 0, 0).toISOString();
      const date6 = new Date(2024, 1, 1, 6, 0, 0).toISOString();
      const date7 = new Date(2024, 1, 1, 7, 0, 0).toISOString();
      const date8 = new Date(2024, 1, 1, 8, 0, 0).toISOString();

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
          from: date2,
          to: date7,
        },
        {
          filterType: 'issuedAt',
          exclude: false,
          from: date8,
          to: undefined,
        },
        {
          filterType: 'issuedAt',
          exclude: false,
          from: undefined,
          to: date1,
        },
        {
          filterType: 'issuedAt',
          exclude: true,
          from: date3,
          to: date4,
        },
        {
          filterType: 'issuedAt',
          exclude: true,
          from: date5,
          to: date6,
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
                      $gte: new Date(date2),
                      $lte: new Date(date7),
                    },
                  },
                  {
                    issuedAt: {
                      $gte: new Date(date8),
                    },
                  },
                  {
                    issuedAt: {
                      $lte: new Date(date1),
                    },
                  },
                ],
              },
              {
                $or: [
                  {
                    issuedAt: {
                      $lt: new Date(date3),
                    },
                  },
                  {
                    issuedAt: {
                      $gt: new Date(date4),
                    },
                  },
                ],
              },
              {
                $or: [
                  {
                    issuedAt: {
                      $lt: new Date(date5),
                    },
                  },
                  {
                    issuedAt: {
                      $gt: new Date(date6),
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
