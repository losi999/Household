import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, createDate } from '@household/shared/common/utils';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, MockService, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IDeferredTransactionDocumentConverter, deferredTransactionDocumentConverterFactory } from '@household/shared/converters/deferred-transaction-document-converter';
import { CategoryType } from '@household/shared/enums';

describe('Deferred transaction document converter', () => {
  let converter: IDeferredTransactionDocumentConverter;
  let mockAccountDocumentConverter: MockService<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: MockService<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: MockService<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: MockService<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: MockService<IProductDocumentConverter>;

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');
    mockProjectDocumentConverter = createMockService('toResponse');
    mockRecipientDocumentConverter = createMockService('toResponse');
    mockCategoryDocumentConverter = createMockService('toResponse');
    mockProductDocumentConverter = createMockService('toResponse');

    vi.useFakeTimers().setSystemTime(new Date());
    converter = deferredTransactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const payingAccountResponse = testDataFactory.account.response();
  const ownerAccountResponse = testDataFactory.account.response();
  const categoryResponse = testDataFactory.category.response();
  const projectResponse = testDataFactory.project.response();
  const recipientResponse = testDataFactory.recipient.response();
  const productResponse = testDataFactory.product.response();

  const payingAccount = testDataFactory.account.document();
  const ownerAccount = testDataFactory.account.document();
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

  describe('create', () => {
    const expiresIn = 3600;
      
    it('should return document', () => {
      const body = testDataFactory.transaction.request.payment();

      const { amount, description, issuedAt } = body;

      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        product,
      }, undefined);

      expect(result).toEqual(testDataFactory.transaction.document.deferred({
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        amount,
        description,
        issuedAt: createDate(issuedAt),
        quantity: undefined,
        product: undefined,
        invoiceNumber: undefined,
        billingEndDate: undefined,
        billingStartDate: undefined,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.transaction.request.payment();

      const { amount, description, issuedAt } = body;

      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        product,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.transaction.document.deferred({
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        amount,
        description,
        issuedAt: createDate(issuedAt),
        quantity: undefined,
        product: undefined,
        invoiceNumber: undefined,
        billingEndDate: undefined,
        billingStartDate: undefined,
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
      }));
    });

    it('should return document with inventory properties', () => {
      const body = testDataFactory.transaction.request.payment();

      const { amount, description, issuedAt, quantity } = body;

      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: inventoryCategory,
        project,
        recipient,
        product,
      }, undefined);
      expect(result).toEqual(testDataFactory.transaction.document.deferred({
        payingAccount,
        ownerAccount,
        category: inventoryCategory,
        project,
        recipient,
        amount,
        description,
        invoiceNumber: undefined,
        billingEndDate: undefined,
        billingStartDate: undefined,
        quantity,
        product,
        issuedAt: createDate(issuedAt),
        expiresAt: undefined,
        _id: undefined,
      }));
    });
    it('should return document with invoice properties', () => {
      const body = testDataFactory.transaction.request.payment();

      const { amount, description, issuedAt, invoiceNumber, billingEndDate, billingStartDate } = body;

      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: invoiceCategory,
        project,
        recipient,
        product,
      }, undefined);
      expect(result).toEqual(testDataFactory.transaction.document.deferred({
        payingAccount,
        ownerAccount,
        category: invoiceCategory,
        project,
        recipient,
        amount,
        description,
        issuedAt: createDate(issuedAt),
        invoiceNumber,
        billingEndDate: createDate(billingEndDate),
        billingStartDate: createDate(billingStartDate),
        quantity: undefined,
        product: undefined,
        expiresAt: undefined,
        _id: undefined,
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(payingAccountResponse);
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(ownerAccountResponse);
      mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
      mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
      mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);

      const doc = testDataFactory.transaction.document.deferred({
        payingAccount,
        ownerAccount,
        project,
        category: regularCategory,
        recipient,
        product,
      });

      const { amount, description, issuedAt, billingEndDate, billingStartDate, quantity, invoiceNumber } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.transaction.response.deferred({
        transactionId: getTransactionId(doc),
        description,
        amount,
        issuedAt: issuedAt.toISOString(),
        payingAccount: payingAccountResponse,
        ownerAccount: ownerAccountResponse,
        project: projectResponse,
        recipient: recipientResponse,
        category: categoryResponse,
        product: productResponse,
        quantity,
        invoiceNumber,
        billingEndDate: billingEndDate.toISOString()
          .split('T')[0],
        billingStartDate: billingStartDate.toISOString()
          .split('T')[0],
      }));
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, payingAccount);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, ownerAccount);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
      expect.assertions(6);
    });
  });

  describe('toResponseList', () => {
    it('should return response', () => {
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(payingAccountResponse);
      mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(ownerAccountResponse);
      mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
      mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
      mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);

      const doc = testDataFactory.transaction.document.deferred({
        payingAccount,
        ownerAccount,
        project,
        category: regularCategory,
        recipient,
        product,
      });

      const { amount, description, issuedAt, billingEndDate, billingStartDate, quantity, invoiceNumber } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        testDataFactory.transaction.response.deferred({
          transactionId: getTransactionId(doc),
          description,
          amount,
          issuedAt: issuedAt.toISOString(),
          payingAccount: payingAccountResponse,
          ownerAccount: ownerAccountResponse,
          project: projectResponse,
          recipient: recipientResponse,
          category: categoryResponse,
          product: productResponse,
          quantity,
          invoiceNumber,
          billingEndDate: billingEndDate.toISOString()
            .split('T')[0],
          billingStartDate: billingStartDate.toISOString()
            .split('T')[0],
        }),
      ]);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, payingAccount);
      validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, ownerAccount);
      validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
      expect.assertions(6);
    });
  });
});
