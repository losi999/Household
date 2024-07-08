import { createAccountDocument, createAccountResponse, createCategoryDocument, createCategoryResponse, createPaymentTransactionDocument, createPaymentTransactionRequest, createPaymentTransactionResponse, createProjectDocument, createProjectResponse, createRecipientDocument, createRecipientResponse, createSplitTransactionDocument, createSplitTransactionRequest, createSplitTransactionResponse, createTransferTransactionDocument, createTransferTransactionRequest, createTransferTransactionResponse, createProductDocument, createSplitRequestIem, createSplitDocumentItem, createSplitResponseIem, createProductResponse, createTransactionReport, createAccountReport, createCategoryReport, createProjectReport, createProductReport, createRecipientReport } from '@household/shared/common/test-data-factory';
import { addSeconds, getTransactionId, getProjectId, getCategoryId, toDictionary, getAccountId, getProductId } from '@household/shared/common/utils';
import { transactionDocumentConverterFactory, ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, Mock, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { Transaction } from '@household/shared/types/types';
import { IDeferredTransactionDocumentConverter } from '@household/shared/converters/deferred-transaction-document-converter';
import { ILoanTransferTransactionDocumentConverter } from '@household/shared/converters/loan-transfer-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { IReimbursementTransactionDocumentConverter } from '@household/shared/converters/reimbursement-transaction-document-converter';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';

describe('Transaction document converter', () => {
  let converter: ITransactionDocumentConverter;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;
  let mockPaymentTransactionDocumentConverter: Mock<IPaymentTransactionDocumentConverter>;
  let mockSplitTransactionDocumentConverter: Mock<ISplitTransactionDocumentConverter>;
  let mockDeferredTransactionDocumentConverter: Mock<IDeferredTransactionDocumentConverter>;
  let mockReimbursementTransactionDocumentConverter: Mock<IReimbursementTransactionDocumentConverter>;
  let mockTransferTransactionDocumentConverter: Mock<ITransferTransactionDocumentConverter>;
  let mockLoanTransferTransactionDocumentConverter: Mock<ILoanTransferTransactionDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse', 'toReport');
    mockProjectDocumentConverter = createMockService('toResponse', 'toReport');
    mockRecipientDocumentConverter = createMockService('toResponse', 'toReport');
    mockCategoryDocumentConverter = createMockService('toResponse', 'toReport');
    mockProductDocumentConverter = createMockService('toResponse', 'toReport');
    mockPaymentTransactionDocumentConverter = createMockService('toResponse');
    mockSplitTransactionDocumentConverter = createMockService('toResponse');
    mockDeferredTransactionDocumentConverter = createMockService('toResponse');
    mockReimbursementTransactionDocumentConverter = createMockService('toResponse');
    mockTransferTransactionDocumentConverter = createMockService('toResponse');
    mockLoanTransferTransactionDocumentConverter = createMockService('toResponse');

    advanceTo(now);
    converter = transactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service, mockPaymentTransactionDocumentConverter.service, mockSplitTransactionDocumentConverter.service, mockDeferredTransactionDocumentConverter.service, mockReimbursementTransactionDocumentConverter.service, mockTransferTransactionDocumentConverter.service, mockLoanTransferTransactionDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const amount = 12000;
  const transferAmount = -12;
  const description = 'bevásárlás';
  const expiresIn = 3600;
  const quantity = 100;
  const invoiceNumber = '2022asdf';
  const billingStartDate = '2022-03-01';
  const billingEndDate = '2022-03-10';

  const account = createAccountDocument();
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

  describe('payment', () => {
    let body: Transaction.PaymentRequest;

    beforeEach(() => {
      body = createPaymentTransactionRequest({
        amount,
        description,
        issuedAt: now.toISOString(),
      });
    });

    const queriedDocument = createPaymentTransactionDocument({
      account,
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

    describe('toResponse', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
        mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);

        const result = converter.toResponse(queriedDocument);
        expect(result).toEqual(createPaymentTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
          issuedAt: now.toISOString(),
          account: accountResponse,
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
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });

    describe('toResponseList', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
        mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);

        const result = converter.toResponseList([queriedDocument]);
        expect(result).toEqual([
          createPaymentTransactionResponse({
            transactionId: getTransactionId(queriedDocument),
            description,
            amount,
            issuedAt: now.toISOString(),
            account: accountResponse,
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
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });

    // describe('toReport', () => {
    //   it('should return report', () => {
    //     const accountReport = createAccountReport();
    //     const categoryReport = createCategoryReport();
    //     const projectReport = createProjectReport();
    //     const productReport = createProductReport();
    //     const recipientReport = createRecipientReport();

    //     mockAccountDocumentConverter.functions.toReport.mockReturnValue(accountReport);
    //     mockCategoryDocumentConverter.functions.toReport.mockReturnValue(categoryReport);
    //     mockProjectDocumentConverter.functions.toReport.mockReturnValue(projectReport);
    //     mockProductDocumentConverter.functions.toReport.mockReturnValue(productReport);
    //     mockRecipientDocumentConverter.functions.toReport.mockReturnValue(recipientReport);

    //     const result = converter.toReport(queriedDocument);
    //     expect(result).toEqual({
    //       ...createTransactionReport(),
    //       amount,
    //       description,
    //       transactionId: getTransactionId(queriedDocument),
    //       account: accountReport,
    //       category: categoryReport,
    //       product: productReport,
    //       project: projectReport,
    //       recipient: recipientReport,
    //     });
    //   });
    // });
  });

  describe('split', () => {
    const body = createSplitTransactionRequest({
      description,
      issuedAt: now.toISOString(),
      splits: [
        createSplitRequestIem({
          description,
          categoryId: getCategoryId(regularCategory),
          projectId: getProjectId(project),
        }),
        createSplitRequestIem({
          description,
          categoryId: getCategoryId(inventoryCategory),
          projectId: getProjectId(project),
          quantity,
          productId,
        }),
        createSplitRequestIem({
          description,
          categoryId: getCategoryId(invoiceCategory),
          projectId: getProjectId(project),
          invoiceNumber,
          billingEndDate,
          billingStartDate,
        }),
      ],
    });

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
    });
    describe('toResponse', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
        mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);

        const result = converter.toResponse(queriedDocument);
        expect(result).toEqual(createSplitTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          issuedAt: now.toISOString(),
          account: accountResponse,
          recipient: recipientResponse,
          splits: [
            createSplitResponseIem({
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
        }));
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });

    describe('toResponseList', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);
        mockProductDocumentConverter.functions.toResponse.mockReturnValue(productResponse);

        const result = converter.toResponseList([queriedDocument]);
        expect(result).toEqual([
          createSplitTransactionResponse({
            transactionId: getTransactionId(queriedDocument),
            description,
            issuedAt: now.toISOString(),
            account: accountResponse,
            recipient: recipientResponse,
            splits: [
              createSplitResponseIem({
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
          }),
        ]);
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, regularCategory);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });
  });

  describe('transfer', () => {
    const transferAccountName = 'transfer account';
    const transferAccount = createAccountDocument({
      name: transferAccountName,
    });
    const transferAccountResponse = createAccountResponse({
      name: transferAccountName,
    });
    const body = createTransferTransactionRequest({
      amount,
      transferAmount,
      description,
      issuedAt: now.toISOString(),
    });

    const queriedDocument = createTransferTransactionDocument({
      account,
      transferAccount,
      amount,
      transferAmount,
      description,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    describe('toResponse', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);

        const result = converter.toResponse(queriedDocument, getAccountId(account));
        expect(result).toEqual(createTransferTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount,
          transferAmount,
          issuedAt: now.toISOString(),
          account: accountResponse,
          transferAccount: transferAccountResponse,

        }));
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, account);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, transferAccount);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
        expect.assertions(6);
      });

      it('should return response with inverted accounts', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);

        const result = converter.toResponse(queriedDocument, getAccountId(transferAccount));
        expect(result).toEqual(createTransferTransactionResponse({
          transactionId: getTransactionId(queriedDocument),
          description,
          amount: transferAmount,
          transferAmount: amount,
          issuedAt: now.toISOString(),
          account: transferAccountResponse,
          transferAccount: accountResponse,

        }));
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, transferAccount);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
        expect.assertions(6);
      });
    });

    describe('toResponseList', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);

        const result = converter.toResponseList([queriedDocument], getAccountId(account));
        expect(result).toEqual([
          createTransferTransactionResponse({
            transactionId: getTransactionId(queriedDocument),
            description,
            amount,
            transferAmount,
            issuedAt: now.toISOString(),
            account: accountResponse,
            transferAccount: transferAccountResponse,
          }),
        ]);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, account);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, transferAccount);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
        expect.assertions(6);
      });
    });
  });
});
