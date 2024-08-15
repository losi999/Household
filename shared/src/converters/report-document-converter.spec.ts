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
          include: true,
        },
        {
          filterType: 'account',
          items: [excludedAccount],
          include: false,
        },
        {
          filterType: 'category',
          items: [includedCategory],
          include: true,
        },
        {
          filterType: 'category',
          items: [excludedCategory],
          include: false,
        },
        {
          filterType: 'project',
          items: [includedProject],
          include: true,
        },
        {
          filterType: 'project',
          items: [excludedProject],
          include: false,
        },
        {
          filterType: 'product',
          items: [includedProduct],
          include: true,
        },
        {
          filterType: 'product',
          items: [excludedProduct],
          include: false,
        },
        {
          filterType: 'recipient',
          items: [includedRecipient],
          include: true,
        },
        {
          filterType: 'recipient',
          items: [excludedRecipient],
          include: false,
        },
        {
          filterType: 'issuedAt',
          include: true,
          from: date2,
          to: date7,
        },
        {
          filterType: 'issuedAt',
          include: true,
          from: date8,
          to: undefined,
        },
        {
          filterType: 'issuedAt',
          include: true,
          from: undefined,
          to: date1,
        },
        {
          filterType: 'issuedAt',
          include: false,
          from: date3,
          to: date4,
        },
        {
          filterType: 'issuedAt',
          include: false,
          from: date5,
          to: date6,
        },
      ]);

      expect(result).toEqual(
        {
          $match: {
            $and: [
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
      );
    });
  });
});
