import { createAccountDocument, createCategoryDocument, createPaymentTransactionDocument, createPaymentTransactionResponse, createProjectDocument, createRecipientDocument, createSplitTransactionDocument, createSplitTransactionResponse, createTransferTransactionDocument, createTransferTransactionResponse, createProductDocument, createTransactionReport, createAccountReport, createCategoryReport, createProjectReport, createProductReport, createRecipientReport, createDeferredTransactionDocument, createDeferredTransactionResponse, createLoanTransferTransactionDocument, createLoanTransferTransactionResponse, createReimbursementTransactionDocument, createReimbursementTransactionResponse, createAccountId, createTransactionRawReport, createTransactionId } from '@household/shared/common/test-data-factory';
import { getTransactionId } from '@household/shared/common/utils';
import { transactionDocumentConverterFactory, ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, Mock, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
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

  const viewingAccountId = createAccountId();
  const paymentDocument = createPaymentTransactionDocument();
  const paymentResponse = createPaymentTransactionResponse();
  const splitDocument = createSplitTransactionDocument();
  const splitResponse = createSplitTransactionResponse();
  const deferredDocument = createDeferredTransactionDocument();
  const deferredResponse = createDeferredTransactionResponse();
  const reimbursementDocument = createReimbursementTransactionDocument();
  const reimbursementResponse = createReimbursementTransactionResponse();
  const transferDocument = createTransferTransactionDocument();
  const transferResponse = createTransferTransactionResponse();
  const loanTransferDocument = createLoanTransferTransactionDocument();
  const loanTransferResponse = createLoanTransferTransactionResponse();
  describe('toResponseList', () => {
    it('should return response list', async () => {
      mockPaymentTransactionDocumentConverter.functions.toResponse.mockReturnValue(paymentResponse);
      mockSplitTransactionDocumentConverter.functions.toResponse.mockReturnValue(splitResponse);
      mockDeferredTransactionDocumentConverter.functions.toResponse.mockReturnValue(deferredResponse);
      mockReimbursementTransactionDocumentConverter.functions.toResponse.mockReturnValue(reimbursementResponse);
      mockTransferTransactionDocumentConverter.functions.toResponse.mockReturnValue(transferResponse);
      mockLoanTransferTransactionDocumentConverter.functions.toResponse.mockReturnValue(loanTransferResponse);

      const result = converter.toResponseList([
        paymentDocument,
        splitDocument,
        deferredDocument,
        reimbursementDocument,
        transferDocument,
        loanTransferDocument,
      ], viewingAccountId);
      expect(result).toEqual([
        paymentResponse,
        splitResponse,
        deferredResponse,
        reimbursementResponse,
        transferResponse,
        loanTransferResponse,
      ]);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse, paymentDocument);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse, splitDocument);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse, deferredDocument);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse, reimbursementDocument);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse, transferDocument, viewingAccountId);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse, loanTransferDocument, viewingAccountId);
    });
  });

  describe('toResponse', () => {
    it('should return payment response', async () => {
      mockPaymentTransactionDocumentConverter.functions.toResponse.mockReturnValue(paymentResponse);

      const result = converter.toResponse(paymentDocument);
      expect(result).toEqual(paymentResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse, paymentDocument);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return split response', async () => {
      mockSplitTransactionDocumentConverter.functions.toResponse.mockReturnValue(splitResponse);

      const result = converter.toResponse(splitDocument);
      expect(result).toEqual(splitResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse, splitDocument);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return deferred response', async () => {
      mockDeferredTransactionDocumentConverter.functions.toResponse.mockReturnValue(deferredResponse);

      const result = converter.toResponse(deferredDocument);
      expect(result).toEqual(deferredResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse, deferredDocument);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return reimbursement response', async () => {
      mockReimbursementTransactionDocumentConverter.functions.toResponse.mockReturnValue(reimbursementResponse);

      const result = converter.toResponse(reimbursementDocument);
      expect(result).toEqual(reimbursementResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse, reimbursementDocument);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return transfer response', async () => {
      mockTransferTransactionDocumentConverter.functions.toResponse.mockReturnValue(transferResponse);

      const result = converter.toResponse(transferDocument, viewingAccountId);
      expect(result).toEqual(transferResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse, transferDocument, viewingAccountId);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return loan transfer response', async () => {
      mockLoanTransferTransactionDocumentConverter.functions.toResponse.mockReturnValue(loanTransferResponse);

      const result = converter.toResponse(loanTransferDocument, viewingAccountId);
      expect(result).toEqual(loanTransferResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockDeferredTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockReimbursementTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransferTransactionDocumentConverter.functions.toResponse, loanTransferDocument, viewingAccountId);
    });
  });

  describe('toReport', () => {
    const amount = 12000;
    const description = 'bevásárlás';
    const quantity = 100;
    const invoiceNumber = '2022asdf';
    const billingStartDate = '2022-03-01';
    const billingEndDate = '2022-03-10';
    const splitId = createTransactionId();

    const account = createAccountDocument();
    const project = createProjectDocument();
    const recipient = createRecipientDocument();
    const regularCategory = createCategoryDocument();
    const product = createProductDocument();

    const accountReport = createAccountReport();
    const categoryReport = createCategoryReport();
    const projectReport = createProjectReport();
    const recipientReport = createRecipientReport();
    const productReport = createProductReport();

    const queriedDocument = createTransactionRawReport({
      account,
      issuedAt: now,
      description,
      project,
      category: regularCategory,
      recipient,
      amount,
      product,
      quantity,
      invoiceNumber,
      billingEndDate: new Date(billingEndDate),
      billingStartDate: new Date(billingStartDate),
      splitId,
    });
    it('should return report', () => {
      mockAccountDocumentConverter.functions.toReport.mockReturnValue(accountReport);
      mockCategoryDocumentConverter.functions.toReport.mockReturnValue(categoryReport);
      mockProjectDocumentConverter.functions.toReport.mockReturnValue(projectReport);
      mockRecipientDocumentConverter.functions.toReport.mockReturnValue(recipientReport);
      mockProductDocumentConverter.functions.toReport.mockReturnValue(productReport);

      const result = converter.toReport(queriedDocument);
      expect(result).toEqual({
        ...createTransactionReport(),
        amount,
        description,
        splitId,
        billingEndDate,
        billingStartDate,
        invoiceNumber,
        transactionId: getTransactionId(queriedDocument),
        account: accountReport,
        category: categoryReport,
        product: productReport,
        project: projectReport,
        recipient: recipientReport,
      });
      validateFunctionCall(mockAccountDocumentConverter.functions.toReport, account);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toReport, regularCategory);
      validateFunctionCall(mockProjectDocumentConverter.functions.toReport, project);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toReport, recipient);
      validateFunctionCall(mockProductDocumentConverter.functions.toReport, {
        document: product,
        quantity,
      });
    });
  });
});
