import { testDataFactory } from '@household/shared/common/test-data-factory';
import { getTransactionId } from '@household/shared/common/utils';
import { transactionDocumentConverterFactory, ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ILoanTransactionDocumentConverter } from '@household/shared/converters/loan-transaction-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { ISplitTransactionDocumentConverter } from '@household/shared/converters/split-transaction-document-converter';
import { ITransferTransactionDocumentConverter } from '@household/shared/converters/transfer-transaction-document-converter';

describe('Transaction document converter', () => {
  let converter: ITransactionDocumentConverter;
  let mockAccountDocumentConverter: MockService<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: MockService<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: MockService<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: MockService<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: MockService<IProductDocumentConverter>;
  let mockPaymentTransactionDocumentConverter: MockService<IPaymentTransactionDocumentConverter>;
  let mockSplitTransactionDocumentConverter: MockService<ISplitTransactionDocumentConverter>;
  let mockLoanTransactionDocumentConverter: MockService<ILoanTransactionDocumentConverter>;
  let mockTransferTransactionDocumentConverter: MockService<ITransferTransactionDocumentConverter>;

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse', 'toReport');
    mockProjectDocumentConverter = createMockService('toResponse', 'toReport');
    mockRecipientDocumentConverter = createMockService('toResponse', 'toReport');
    mockCategoryDocumentConverter = createMockService('toResponse', 'toReport');
    mockProductDocumentConverter = createMockService('toResponse', 'toReport');
    mockPaymentTransactionDocumentConverter = createMockService('toResponse');
    mockSplitTransactionDocumentConverter = createMockService('toResponse');
    mockLoanTransactionDocumentConverter = createMockService('toResponse');
    mockTransferTransactionDocumentConverter = createMockService('toResponse');
    vi.useFakeTimers();
    vi.setSystemTime(new Date());
    converter = transactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service, mockPaymentTransactionDocumentConverter.service, mockSplitTransactionDocumentConverter.service, mockLoanTransactionDocumentConverter.service, mockTransferTransactionDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const viewingAccountId = testDataFactory.account.id();
  const paymentDocument = testDataFactory.transaction.document.payment();
  const paymentResponse = testDataFactory.transaction.response.payment();
  const splitDocument = testDataFactory.transaction.document.split();
  const splitResponse = testDataFactory.transaction.response.split();
  const loanDocument = testDataFactory.transaction.document.loan();
  const loanResponse = testDataFactory.transaction.response.loan();
  const transferDocument = testDataFactory.transaction.document.transfer();
  const transferResponse = testDataFactory.transaction.response.transfer();
  describe('toResponseList', () => {
    it('should return response list', async () => {
      mockPaymentTransactionDocumentConverter.functions.toResponse.mockReturnValue(paymentResponse);
      mockSplitTransactionDocumentConverter.functions.toResponse.mockReturnValue(splitResponse);
      mockLoanTransactionDocumentConverter.functions.toResponse.mockReturnValue(loanResponse);
      mockTransferTransactionDocumentConverter.functions.toResponse.mockReturnValue(transferResponse);

      const result = converter.toResponseList([
        paymentDocument,
        splitDocument,
        loanDocument,
        transferDocument,
      ], viewingAccountId);
      expect(result).toEqual([
        paymentResponse,
        splitResponse,
        loanResponse,
        transferResponse,
      ]);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse, paymentDocument);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse, splitDocument);
      validateFunctionCall(mockLoanTransactionDocumentConverter.functions.toResponse, loanDocument);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse, transferDocument, viewingAccountId);
    });
  });

  describe('toResponse', () => {
    it('should return payment response', async () => {
      mockPaymentTransactionDocumentConverter.functions.toResponse.mockReturnValue(paymentResponse);

      const result = converter.toResponse(paymentDocument);
      expect(result).toEqual(paymentResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse, paymentDocument);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return split response', async () => {
      mockSplitTransactionDocumentConverter.functions.toResponse.mockReturnValue(splitResponse);

      const result = converter.toResponse(splitDocument);
      expect(result).toEqual(splitResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse, splitDocument);
      validateFunctionCall(mockLoanTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return loan response', async () => {
      mockLoanTransactionDocumentConverter.functions.toResponse.mockReturnValue(loanResponse);

      const result = converter.toResponse(loanDocument);
      expect(result).toEqual(loanResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransactionDocumentConverter.functions.toResponse, loanDocument);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse);
    });

    it('should return transfer response', async () => {
      mockTransferTransactionDocumentConverter.functions.toResponse.mockReturnValue(transferResponse);

      const result = converter.toResponse(transferDocument, viewingAccountId);
      expect(result).toEqual(transferResponse);
      validateFunctionCall(mockPaymentTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockSplitTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockLoanTransactionDocumentConverter.functions.toResponse);
      validateFunctionCall(mockTransferTransactionDocumentConverter.functions.toResponse, transferDocument, viewingAccountId);
    });
  });

  describe('toReport', () => {
    const account = testDataFactory.account.document();
    const project = testDataFactory.project.document();
    const recipient = testDataFactory.recipient.document();
    const regularCategory = testDataFactory.category.document();
    const product = testDataFactory.product.document.generic();

    const accountReport = testDataFactory.account.report();
    const categoryReport = testDataFactory.category.report();
    const projectReport = testDataFactory.project.report();
    const recipientReport = testDataFactory.recipient.report();
    const productReport = testDataFactory.product.report();

    const doc = testDataFactory.transaction.document.report({
      account,
      project,
      category: regularCategory,
      recipient,
      product,
    });
    it('should return report', () => {
      mockAccountDocumentConverter.functions.toReport.mockReturnValue(accountReport);
      mockCategoryDocumentConverter.functions.toReport.mockReturnValue(categoryReport);
      mockProjectDocumentConverter.functions.toReport.mockReturnValue(projectReport);
      mockRecipientDocumentConverter.functions.toReport.mockReturnValue(recipientReport);
      mockProductDocumentConverter.functions.toReport.mockReturnValue(productReport);

      const { amount, description, billingEndDate, billingStartDate, invoiceNumber, quantity, issuedAt } = doc;

      const result = converter.toReport(doc);
      expect(result).toEqual(testDataFactory.transaction.report({
        amount,
        issuedAt: issuedAt.toISOString(),
        description,
        billingEndDate: billingEndDate.toISOString().split('T')[0],
        billingStartDate: billingStartDate.toISOString().split('T')[0],
        invoiceNumber,
        quantity,
        account: accountReport,
        category: categoryReport,
        product: productReport,
        project: projectReport,
        recipient: recipientReport,
        transactionId: getTransactionId(doc),
      }));
      validateFunctionCall(mockAccountDocumentConverter.functions.toReport, account);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toReport, regularCategory);
      validateFunctionCall(mockProjectDocumentConverter.functions.toReport, project);
      validateFunctionCall(mockRecipientDocumentConverter.functions.toReport, recipient);
      validateFunctionCall(mockProductDocumentConverter.functions.toReport, product);
    });
  });
});
