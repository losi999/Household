import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, getProjectId, getCategoryId, toDictionary, getAccountId, getProductId, createDate } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ISplitTransactionDocumentConverter, splitTransactionDocumentConverterFactory } from '@household/shared/converters/split-transaction-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { CategoryType } from '@household/shared/enums';

describe('Split transaction document converter', () => {
  let converter: ISplitTransactionDocumentConverter;
  let mockAccountDocumentConverter: MockService<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: MockService<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: MockService<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: MockService<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: MockService<IProductDocumentConverter>;
  let mockDeferredDocumentConverter: MockService<IDeferredTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');
    mockProjectDocumentConverter = createMockService('toResponse');
    mockRecipientDocumentConverter = createMockService('toResponse');
    mockCategoryDocumentConverter = createMockService('toResponse');
    mockProductDocumentConverter = createMockService('toResponse');
    mockDeferredDocumentConverter = createMockService('create', 'toResponse');

    vi.useFakeTimers().setSystemTime(new Date());
    converter = splitTransactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service, mockDeferredDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  const account = testDataFactory.account.document();
  const loanAccount = testDataFactory.account.document();
  const project = testDataFactory.project.document();
  const recipient = testDataFactory.recipient.document();
  const regularCategory = testDataFactory.category.document({
    categoryType: CategoryType.Regular,
  });
  const invoiceCategory = testDataFactory.category.document({
    categoryType: CategoryType.Invoice,
  });
  const inventoryCategory = testDataFactory.category.document({
    categoryType: CategoryType.Inventory,
  });
  const product = testDataFactory.product.document();
  const productId = getProductId(product);

  const accountResponse = testDataFactory.account.response();
  const categoryResponse = testDataFactory.category.response();
  const projectResponse = testDataFactory.project.response();
  const recipientResponse = testDataFactory.recipient.response();
  const productResponse = testDataFactory.product.response();

  const deferredTransactionResponse = testDataFactory.transaction.response.deferred();

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.transaction.request.split({
        accountId: getAccountId(account),
        loans: [
          {
            categoryId: getCategoryId(regularCategory),
            projectId: getProjectId(project),
            loanAccountId: getAccountId(loanAccount),
          },
        ],
        splits: [
          {
            categoryId: getCategoryId(regularCategory),
            projectId: getProjectId(project),
          },
          {
            categoryId: getCategoryId(inventoryCategory),
            projectId: getProjectId(project),
            productId,
          },
          {
            categoryId: getCategoryId(invoiceCategory),
            projectId: getProjectId(project),
          },
        ],
      });

      const { description, issuedAt, loans: [loan], splits: [
        regularSplit,
        inventorySplit,
        invoiceSplit,
      ] } = body;

      const deferredTransaction = testDataFactory.transaction.document.deferred({
        category: regularCategory,
        project,
        payingAccount: account,
        ownerAccount: loanAccount,
        amount: loan.amount,
        description: loan.description,
        quantity: undefined,
        invoiceNumber: undefined,
        billingStartDate: undefined,
        billingEndDate: undefined,
        product: undefined,
      });

      mockDeferredDocumentConverter.functions.create.mockReturnValue(deferredTransaction);

      const result = converter.create({
        body,
        accounts: toDictionary([account], '_id'),
        categories: toDictionary([
          regularCategory,
          inventoryCategory,
          invoiceCategory,
        ], '_id'),
        projects: toDictionary([project], '_id'),
        products: toDictionary([product], '_id'),
        recipient,
      }, undefined);
      expect(result).toEqual(testDataFactory.transaction.document.split({
        account,
        recipient,
        description,
        amount: loan.amount + regularSplit.amount + inventorySplit.amount + invoiceSplit.amount,
        issuedAt: createDate(issuedAt),
        expiresAt: undefined,
        _id: undefined,
        deferredSplits: [deferredTransaction],
        splits: [
          {
            amount: regularSplit.amount,
            description: regularSplit.description,
            category: regularCategory,
            project,
            quantity: undefined,
            invoiceNumber: undefined,
            billingStartDate: undefined,
            billingEndDate: undefined,
            product: undefined,
          },
          {
            amount: inventorySplit.amount,
            description: inventorySplit.description,
            category: inventoryCategory,
            project,
            quantity: inventorySplit.quantity,
            invoiceNumber: undefined,
            billingStartDate: undefined,
            billingEndDate: undefined,
            product,
          },
          {
            amount: invoiceSplit.amount,
            description: invoiceSplit.description,
            category: invoiceCategory,
            project,
            quantity: undefined,
            invoiceNumber: invoiceSplit.invoiceNumber,
            billingStartDate: createDate(invoiceSplit.billingStartDate),
            billingEndDate: createDate(invoiceSplit.billingEndDate),
            product: undefined,
          },
        ],
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.transaction.request.split({
        accountId: getAccountId(account),
        loans: undefined,
        splits: [
          {
            categoryId: getCategoryId(regularCategory),
            projectId: getProjectId(project),
          },
        ],
      });

      const { description, issuedAt, splits: [split] } = body;

      const result = converter.create({
        body,
        accounts: toDictionary([account], '_id'),
        categories: toDictionary([
          regularCategory,
          inventoryCategory,
          invoiceCategory,
        ], '_id'),
        projects: toDictionary([project], '_id'),
        products: toDictionary([product], '_id'),
        recipient,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.transaction.document.split({
        account,
        recipient,
        amount: split.amount,
        description,
        issuedAt: createDate(issuedAt),
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
        splits: [
          {
            amount: split.amount,
            description: split.description,
            category: regularCategory,
            project,
            quantity: undefined,
            invoiceNumber: undefined,
            billingStartDate: undefined,
            billingEndDate: undefined,
            product: undefined,
          },
        ],
        deferredSplits: [],
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
      mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
      mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
      mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);
      mockDeferredDocumentConverter.functions.toResponse.mockReturnValue(deferredTransactionResponse);

      const doc = testDataFactory.transaction.document.split({
        account,
        recipient,
        deferredSplits: [
          {
            category: regularCategory,
            project,
            payingAccount: account,
            ownerAccount: loanAccount,
          },
        ],
        splits: [
          {
            category: regularCategory,
            product,
            project,
          },
        ],
      });

      const { amount, description, issuedAt, deferredSplits: [deferred], splits: [split] } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.transaction.response.split({
        transactionId: getTransactionId(doc),
        description,
        amount,
        issuedAt: issuedAt.toISOString(),
        account: accountResponse,
        recipient: recipientResponse,
        splits: [
          {
            amount: split.amount,
            description: split.description,
            category: categoryResponse,
            project: projectResponse,
            quantity: split.quantity,
            invoiceNumber: split.invoiceNumber,
            billingStartDate: split.billingStartDate.toISOString().split('T')[0],
            billingEndDate: split.billingEndDate.toISOString().split('T')[0],
            product: productResponse,
          },
        ],
        deferredSplits: [deferredTransactionResponse],
      }));
      validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
      validateFunctionCall(mockDeferredDocumentConverter.functions.toResponse, deferred);
      expect.assertions(6);
    });
  });

  // describe('toResponseList', () => {
  //   it('should return response', () => {
  //     mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
  //     mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
  //     mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
  //     mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
  //     mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);
  //     mockDeferredDocumentConverter.functions.toResponse.mockReturnValue(deferredTransactionResponse);

  //     const result = converter.toResponseList([doc]);
  //     expect(result).toEqual([
  //       testDataFactory.transaction.response.split({
  //         transactionId: getTransactionId(doc),
  //         description,
  //         issuedAt: now.toISOString(),
  //         account: accountResponse,
  //         recipient: recipientResponse,
  //         splits: [
  //           {
  //             description,
  //             category: categoryResponse,
  //             project: projectResponse,
  //             product: productResponse,
  //             quantity,
  //             invoiceNumber,
  //             billingEndDate: new Date(billingEndDate).toISOString()
  //               .split('T')[0],
  //             billingStartDate: new Date(billingStartDate).toISOString()
  //               .split('T')[0],
  //           },
  //         ],
  //         deferredSplits: [deferredTransactionResponse],
  //       }),
  //     ]);
  //     validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
  //     validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
  //     validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
  //     validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
  //     validateFunctionCall(mockDeferredDocumentConverter.functions.toResponse, deferredTransaction);
  //     expect.assertions(6);
  //   });
  // });
});
