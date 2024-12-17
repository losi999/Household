import { createAccountDocument, createAccountResponse, createCategoryDocument, createCategoryResponse, createProjectDocument, createProjectResponse, createRecipientDocument, createRecipientResponse, createSplitTransactionDocument, createSplitTransactionRequest, createSplitTransactionResponse, createProductDocument, createSplitResponseItem, createProductResponse, createSplitRequestItem, createSplitDocumentItem, createDeferredTransactionDocument, createDeferredTransactionResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, getProjectId, getCategoryId, toDictionary, getAccountId, getProductId } from '@household/shared/common/utils';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, Mock, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ISplitTransactionDocumentConverter, splitTransactionDocumentConverterFactory } from '@household/shared/converters/split-transaction-document-converter';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';

describe('Split transaction document converter', () => {
  let converter: ISplitTransactionDocumentConverter;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;
  let mockDeferredDocumentConverter: Mock<IDeferredTransactionDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');
    mockProjectDocumentConverter = createMockService('toResponse');
    mockRecipientDocumentConverter = createMockService('toResponse');
    mockCategoryDocumentConverter = createMockService('toResponse');
    mockProductDocumentConverter = createMockService('toResponse');
    mockDeferredDocumentConverter = createMockService('create', 'toResponse');

    advanceTo(now);
    converter = splitTransactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service, mockDeferredDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const description = 'bevásárlás';
  const expiresIn = 3600;
  const quantity = 100;
  const invoiceNumber = '2022asdf';
  const billingStartDate = '2022-03-01';
  const billingEndDate = '2022-03-10';

  const account = createAccountDocument();
  const loanAccount = createAccountDocument();
  const project = createProjectDocument();
  const recipient = createRecipientDocument();
  const regularCategory = createCategoryDocument();
  const invoiceCategory = createCategoryDocument({
    categoryType: 'invoice',
  });
  const inventoryCategory = createCategoryDocument({
    categoryType: 'inventory',
  });
  const product = createProductDocument();
  const productId = getProductId(product);

  const accountResponse = createAccountResponse();
  const categoryResponse = createCategoryResponse();
  const projectResponse = createProjectResponse();
  const recipientResponse = createRecipientResponse();
  const productResponse = createProductResponse();

  const body = createSplitTransactionRequest({
    accountId: getAccountId(account),
    description,
    issuedAt: now.toISOString(),
    splits: [
      createSplitRequestItem({
        description,
        categoryId: getCategoryId(regularCategory),
        projectId: getProjectId(project),
      }),
      createSplitRequestItem({
        description,
        categoryId: getCategoryId(inventoryCategory),
        projectId: getProjectId(project),
        quantity,
        productId,
      }),
      createSplitRequestItem({
        description,
        categoryId: getCategoryId(invoiceCategory),
        projectId: getProjectId(project),
        invoiceNumber,
        billingEndDate,
        billingStartDate,
      }),
      createSplitRequestItem({
        description,
        categoryId: getCategoryId(regularCategory),
        projectId: getProjectId(project),
        loanAccountId: getAccountId(loanAccount),
      }),
    ],
  });

  const deferredTransaction = createDeferredTransactionDocument({
    _id: undefined,
  });
  const deferredTransactionResponse = createDeferredTransactionResponse();

  const queriedDocument = createSplitTransactionDocument({
    account,
    recipient,
    description,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
    splits: [
      createSplitDocumentItem({
        category: regularCategory,
        description,
        project,
        product,
        quantity,
        invoiceNumber,
        billingEndDate: new Date(billingEndDate),
        billingStartDate: new Date(billingStartDate),
      }),
    ],
    deferredSplits: [deferredTransaction],
  });

  describe('create', () => {
    it('should return document', () => {
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
      expect(result).toEqual(createSplitTransactionDocument({
        account,
        recipient,
        description,
        issuedAt: now,
        expiresAt: undefined,
        _id: undefined,
        splits: [
          createSplitDocumentItem({
            category: regularCategory,
            description,
            project,
            product: undefined,
            quantity: undefined,
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
            _id: undefined,
          }),
          createSplitDocumentItem({
            category: inventoryCategory,
            description,
            project,
            quantity,
            product,
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
            _id: undefined,
          }),
          createSplitDocumentItem({
            category: invoiceCategory,
            description,
            project,
            product: undefined,
            quantity: undefined,
            invoiceNumber,
            billingEndDate: new Date(billingEndDate),
            billingStartDate: new Date(billingStartDate),
            _id: undefined,
          }),
        ],
        deferredSplits: [deferredTransaction],
      }));
    });

    it('should return expiring document', () => {
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
      }, expiresIn);
      expect(result).toEqual(createSplitTransactionDocument({
        account,
        recipient,
        description,
        issuedAt: now,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
        splits: [
          createSplitDocumentItem({
            category: regularCategory,
            description,
            project,
            product: undefined,
            quantity: undefined,
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
            _id: undefined,
          }),
          createSplitDocumentItem({
            category: inventoryCategory,
            description,
            project,
            quantity,
            product,
            invoiceNumber: undefined,
            billingEndDate: undefined,
            billingStartDate: undefined,
            _id: undefined,
          }),
          createSplitDocumentItem({
            category: invoiceCategory,
            description,
            project,
            product: undefined,
            quantity: undefined,
            invoiceNumber,
            billingEndDate: new Date(billingEndDate),
            billingStartDate: new Date(billingStartDate),
            _id: undefined,
          }),
        ],
        deferredSplits: [deferredTransaction],
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

      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createSplitTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        issuedAt: now.toISOString(),
        account: accountResponse,
        recipient: recipientResponse,
        splits: [
          createSplitResponseItem({
            description,
            category: categoryResponse,
            project: projectResponse,
            product: productResponse,
            quantity,
            invoiceNumber,
            billingEndDate: new Date(billingEndDate).toISOString()
              .split('T')[0],
            billingStartDate: new Date(billingStartDate).toISOString()
              .split('T')[0],
          }),
        ],
        deferredSplits: [deferredTransactionResponse],
      }));
      validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
      validateFunctionCall(mockDeferredDocumentConverter.functions.toResponse, deferredTransaction);
      expect.assertions(6);
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
      mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
      mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
      mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);
      mockDeferredDocumentConverter.functions.toResponse.mockReturnValue(deferredTransactionResponse);

      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createSplitTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          issuedAt: now.toISOString(),
          account: accountResponse,
          recipient: recipientResponse,
          splits: [
            createSplitResponseItem({
              description,
              category: categoryResponse,
              project: projectResponse,
              product: productResponse,
              quantity,
              invoiceNumber,
              billingEndDate: new Date(billingEndDate).toISOString()
                .split('T')[0],
              billingStartDate: new Date(billingStartDate).toISOString()
                .split('T')[0],
            }),
          ],
          deferredSplits: [deferredTransactionResponse],
        }),
      ]);
      validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
      validateFunctionCall(mockDeferredDocumentConverter.functions.toResponse, deferredTransaction);
      expect.assertions(6);
    });
  });
});
