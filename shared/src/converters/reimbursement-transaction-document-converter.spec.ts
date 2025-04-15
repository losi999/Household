import { createAccountDocument, createAccountResponse, createCategoryDocument, createCategoryResponse, createReimbursementTransactionDocument, createReimbursementTransactionResponse, createProjectDocument, createProjectResponse, createRecipientDocument, createRecipientResponse, createProductDocument, createProductResponse, createPaymentTransactionRequest } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, getProductId } from '@household/shared/common/utils';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, Mock, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { Transaction } from '@household/shared/types/types';
import { IReimbursementTransactionDocumentConverter, reimbursementTransactionDocumentConverterFactory } from '@household/shared/converters/reimbursement-transaction-document-converter';

describe('Reimbursement transaction document converter', () => {
  let converter: IReimbursementTransactionDocumentConverter;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');
    mockProjectDocumentConverter = createMockService('toResponse');
    mockRecipientDocumentConverter = createMockService('toResponse');
    mockCategoryDocumentConverter = createMockService('toResponse');
    mockProductDocumentConverter = createMockService('toResponse');

    advanceTo(now);
    converter = reimbursementTransactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const amount = 12000;
  const description = 'bevásárlás';
  const expiresIn = 3600;
  const quantity = 100;
  const invoiceNumber = '2022asdf';
  const billingStartDate = '2022-03-01';
  const billingEndDate = '2022-03-10';

  const payingAccount = createAccountDocument();
  const ownerAccount = createAccountDocument();
  const project = createProjectDocument();
  const recipient = createRecipientDocument();
  const regularCategory = createCategoryDocument();
  const invoiceCategory = createCategoryDocument({
    categoryType: CategoryType.Invoice,
  });
  const inventoryCategory = createCategoryDocument({
    categoryType: CategoryType.Inventory,
  });
  const product = createProductDocument();
  const productId = getProductId(product);

  const payingAccountResponse = createAccountResponse();
  const ownerAccountResponse = createAccountResponse();
  const categoryResponse = createCategoryResponse();
  const projectResponse = createProjectResponse();
  const recipientResponse = createRecipientResponse();
  const productResponse = createProductResponse();

  let body: Transaction.PaymentRequest;

  beforeEach(() => {
    body = createPaymentTransactionRequest({
      amount,
      description,
      issuedAt: now.toISOString(),
    });
  });

  const queriedDocument = createReimbursementTransactionDocument({
    payingAccount,
    ownerAccount,
    project,
    category: regularCategory,
    recipient,
    amount,
    description,
    product,
    quantity,
    invoiceNumber,
    billingEndDate: new Date(billingEndDate),
    billingStartDate: new Date(billingStartDate),
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        product,
      }, undefined);
      expect(result).toEqual(createReimbursementTransactionDocument({
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        amount,
        description,
        issuedAt: now,
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
      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        product,
      }, expiresIn);
      expect(result).toEqual(createReimbursementTransactionDocument({
        payingAccount,
        ownerAccount,
        category: regularCategory,
        project,
        recipient,
        amount,
        description,
        issuedAt: now,
        quantity: undefined,
        product: undefined,
        invoiceNumber: undefined,
        billingEndDate: undefined,
        billingStartDate: undefined,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

    it('should return document with inventory properties', () => {
      body.quantity = quantity;
      body.productId = productId;

      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: inventoryCategory,
        project,
        recipient,
        product,
      }, undefined);
      expect(result).toEqual(createReimbursementTransactionDocument({
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
        issuedAt: now,
        expiresAt: undefined,
        _id: undefined,
      }));
    });
    it('should return document with invoice properties', () => {
      body.invoiceNumber = invoiceNumber;
      body.billingStartDate = billingStartDate;
      body.billingEndDate = billingEndDate;

      const result = converter.create({
        body,
        payingAccount,
        ownerAccount,
        category: invoiceCategory,
        project,
        recipient,
        product,
      }, undefined);
      expect(result).toEqual(createReimbursementTransactionDocument({
        payingAccount,
        ownerAccount,
        category: invoiceCategory,
        project,
        recipient,
        amount,
        description,
        invoiceNumber,
        billingEndDate: new Date(billingEndDate),
        billingStartDate: new Date(billingStartDate),
        quantity: undefined,
        product: undefined,
        issuedAt: now,
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

      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createReimbursementTransactionResponse({
        transactionId: getTransactionId(queriedDocument),
        description,
        amount,
        issuedAt: now.toISOString(),
        payingAccount: payingAccountResponse,
        ownerAccount: ownerAccountResponse,
        project: projectResponse,
        recipient: recipientResponse,
        category: categoryResponse,
        product: productResponse,
        quantity,
        invoiceNumber,
        billingEndDate: new Date(billingEndDate).toISOString()
          .split('T')[0],
        billingStartDate: new Date(billingStartDate).toISOString()
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

      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createReimbursementTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
          issuedAt: now.toISOString(),
          payingAccount: payingAccountResponse,
          ownerAccount: ownerAccountResponse,
          project: projectResponse,
          recipient: recipientResponse,
          category: categoryResponse,
          product: productResponse,
          quantity,
          invoiceNumber,
          billingEndDate: new Date(billingEndDate).toISOString()
            .split('T')[0],
          billingStartDate: new Date(billingStartDate).toISOString()
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
