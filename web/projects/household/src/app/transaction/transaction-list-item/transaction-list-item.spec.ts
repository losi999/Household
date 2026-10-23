import { formatDate, formatNumber, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconButton } from '@angular/material/button';
import { MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatExpansionPanel, MatExpansionPanelTitle } from '@angular/material/expansion';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { createStubComponent, elementSelectorFactory, IconText, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { transactionEvents } from '@household/state/transaction/transaction-events';
import { TransactionStore } from '@household/state/transaction/transaction-store';
import { Dispatcher } from '@ngrx/signals/events';
import { TransactionListItem } from './transaction-list-item';

registerLocaleData(localeHu);

describe('TransactionListItem', () => {
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<TransactionListItem>;
  let selector: IElementSelector;
  let mockTransactionStore: MockSignalStore<typeof TransactionStore>;
  let mockDispatcher: Dispatcher;

  const accountId = testDataFactory.account.id();
  const accountOfUrl = testDataFactory.account.response({
    accountId,
  });
  const otherAccount = testDataFactory.account.response();

  const thisYear = new Date().getFullYear();
  const issuedAtThisYear = new Date(thisYear, 5, 15, 12, 30).toISOString();
  const issuedAtLastYear = new Date(thisYear - 1, 5, 15, 12, 30).toISOString();

  const defaultTransaction = testDataFactory.transaction.response.payment({
    issuedAt: issuedAtThisYear,
  });

  const render = async (params?: {
    transaction?: Responses.Transaction;
    accountId?: Api.Account.Id;
    isInProgress?: Api.Transaction.Id[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TransactionListItem],
      providers: [
        provideMockSignalStore(TransactionStore, 'isInProgress'),
        provideMockDispatcher(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                accountId: params?.accountId ?? accountId,
              }),
            },
          },
        },
      ],
    })
      .overrideComponent(TransactionListItem, {
        remove: {
          imports: [IconText],
        },
        add: {
          imports: [IconTextStub],
        },
      })
      .compileComponents();

    mockTransactionStore = TestBed.inject<MockSignalStore<typeof TransactionStore>>(TransactionStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockTransactionStore.isInProgress.set(params?.isInProgress ?? []);

    fixture = TestBed.createComponent(TransactionListItem);
    fixture.componentRef.setInput('transaction', params?.transaction ?? defaultTransaction);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  const getIconTexts = () => {
    return selector.listComponents<IconText>(IconTextStub).map(iconText => ({
      icon: iconText.componentInstance.icon(),
      text: iconText.componentInstance.text(),
    }));
  };

  const getAmount = () => selector.getElementByCss('.amount');
  const getAmountClasses = () => Array.from(getAmount().nativeElement.classList);
  const getIconTextsIn = (cssQuery: string) => {
    return selector.listComponents<IconText>(IconTextStub, selector.getElementByCss(cssQuery) as DebugElement).map(iconText => ({
      icon: iconText.componentInstance.icon(),
      text: iconText.componentInstance.text(),
    }));
  };
  const getSubtitles = () => selector.listComponents(MatCardSubtitle).map(subtitle => subtitle.nativeElement.textContent.trim());
  const getTitle = () => selector.getComponent(MatCardTitle).nativeElement.textContent.trim();
  const getPanels = () => selector.listComponents(MatExpansionPanel);

  const formatAmount = (amount: number, currency: string) => `${formatNumber(amount, 'hu', '1.0-2')} ${currency}`;

  describe('date', () => {
    it('should be rendered as title', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
        }),
      });

      expect(getTitle()).toBe(formatDate(issuedAtThisYear, 'MMM d., EEEE', 'en-US'));
    });

    it('should render only the time as subtitle if the transaction was issued this year', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
        }),
      });

      expect(getSubtitles()).toEqual([formatDate(issuedAtThisYear, 'HH:mm', 'en-US')]);
    });

    it('should render the year too if the transaction was issued in another year', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtLastYear,
        }),
      });

      expect(getSubtitles()).toEqual([
        `${thisYear - 1}`,
        formatDate(issuedAtLastYear, 'HH:mm', 'en-US'),
      ]);
    });
  });

  describe('amount of a payment transaction', () => {
    it('should be rendered with the currency of the account', async () => {
      const transaction = testDataFactory.transaction.response.payment({
        issuedAt: issuedAtThisYear,
        amount: -1234.567,
        account: testDataFactory.account.response({
          currency: 'HUF',
        }),
      });

      await render({
        transaction,
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(-1234.567, 'HUF'));
    });

    it('should be red if negative', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          amount: -100,
        }),
      });

      expect(getAmountClasses()).toContain('red-text');
    });

    it('should be green if positive', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          amount: 100,
        }),
      });

      expect(getAmountClasses()).toContain('green-text');
    });
  });

  describe('amount of a transfer transaction', () => {
    it('should be rendered with the currency of the account', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -500,
          account: testDataFactory.account.response({
            currency: 'EUR',
          }),
        }),
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(-500, 'EUR'));
    });

    it('should be red if negative and the account is not a loan', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -500,
          account: testDataFactory.account.response({
            accountType: AccountType.BankAccount,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('red-text');
    });

    it('should be green if positive and the account is not a loan', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: 500,
          account: testDataFactory.account.response({
            accountType: AccountType.BankAccount,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('green-text');
    });

    it('should be green if negative and the account is a loan', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -500,
          account: testDataFactory.account.response({
            accountType: AccountType.Loan,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('green-text');
    });

    it('should be red if positive and the account is a loan', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: 500,
          account: testDataFactory.account.response({
            accountType: AccountType.Loan,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('red-text');
    });
  });

  describe('transfer amount of a transfer transaction', () => {
    const getTransferAmount = () => selector.getElementByCss('.transfer-amount');

    it('should be rendered with the currency of the transfer account if it differs from the amount', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -100,
          transferAmount: 40,
          transferAccount: testDataFactory.account.response({
            currency: 'EUR',
          }),
        }),
      });

      expect(getTransferAmount().nativeElement.textContent.trim()).toBe(formatAmount(40, 'EUR'));
    });

    it('should be rendered under the amount', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -100,
          transferAmount: 40,
        }),
      });

      const amounts = Array.from(selector.getElementByCss('.amounts').nativeElement.children);

      expect(amounts).toEqual([
        getAmount().nativeElement,
        getTransferAmount().nativeElement,
      ]);
    });

    it('should not be rendered if it is the same as the amount', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -100,
          transferAmount: 100,
        }),
      });

      expect(getTransferAmount()).toBeFalsy();
    });

    it('should not be rendered for other transaction types', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
        }),
      });

      expect(getTransferAmount()).toBeFalsy();
    });
  });

  describe('amount of a loan transaction', () => {
    it('should be rendered with the currency of the paying account', async () => {
      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          amount: -300,
          ownerAccount: otherAccount,
          payingAccount: testDataFactory.account.response({
            accountId,
            currency: 'USD',
          }),
        }),
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(-300, 'USD'));
    });

    it('should be inverted if the owner account is the account in the url', async () => {
      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          amount: -300,
          ownerAccount: accountOfUrl,
          payingAccount: otherAccount,
        }),
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(300, otherAccount.currency));
    });

    it('should be green if the paying account is the loan account in the url', async () => {
      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount: otherAccount,
          payingAccount: testDataFactory.account.response({
            accountId,
            accountType: AccountType.Loan,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('green-text');
    });

    it('should be red if the paying account is the account in the url but it is not a loan', async () => {
      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount: otherAccount,
          payingAccount: testDataFactory.account.response({
            accountId,
            accountType: AccountType.BankAccount,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('red-text');
    });

    it('should be red if the paying account is not the account in the url', async () => {
      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount: accountOfUrl,
          payingAccount: testDataFactory.account.response({
            accountType: AccountType.Loan,
          }),
        }),
      });

      expect(getAmountClasses()).toContain('red-text');
    });
  });

  describe('amount of a split transaction', () => {
    it('should be the amount of the transaction with the currency of the account if it is the account in the url', async () => {
      const transaction = testDataFactory.transaction.response.split({
        issuedAt: issuedAtThisYear,
        account: testDataFactory.account.response({
          accountId,
          currency: 'HUF',
        }),
        splits: [
          {
            amount: -100,
          },
        ],
        loans: [
          {
            amount: -50,
          },
        ],
      });

      await render({
        transaction,
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(-150, 'HUF'));
    });

    it('should be the sum of the loans of the account in the url if the transaction belongs to another account', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: testDataFactory.account.response({
            currency: 'HUF',
          }),
          splits: [
            {
              amount: -1000,
            },
          ],
          loans: [
            {
              amount: -100,
              ownerAccount: accountOfUrl,
            },
            {
              amount: -50,
              ownerAccount: accountOfUrl,
            },
            {
              amount: -25,
              ownerAccount: otherAccount,
            },
          ],
        }),
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(150, 'HUF'));
    });

    it('should be red if the amount of the transaction is negative', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          splits: [
            {
              amount: -100,
            },
          ],
          loans: [],
        }),
      });

      expect(getAmountClasses()).toContain('red-text');
    });

    it('should be green if the amount of the transaction is positive', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          splits: [
            {
              amount: 100,
            },
          ],
          loans: [],
        }),
      });

      expect(getAmountClasses()).toContain('green-text');
    });
  });

  describe('description', () => {
    it('should be rendered', async () => {
      const transaction = testDataFactory.transaction.response.payment({
        issuedAt: issuedAtThisYear,
      });

      await render({
        transaction,
      });

      expect(getIconTexts()).toContainEqual({
        icon: 'description',
        text: transaction.description,
      });
    });

    it('should not be rendered if missing', async () => {
      const transaction = testDataFactory.transaction.response.payment({
        issuedAt: issuedAtThisYear,
        description: undefined,
      });

      await render({
        transaction,
      });

      expect(getIconTexts().find(i => i.icon === 'description')).toBeFalsy();
    });
  });

  describe('description of the other transaction types', () => {
    it.each([
      [
        'transfer',
        () => testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
        }),
      ],
      [
        'loan',
        () => testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
        }),
      ],
      [
        'split',
        () => testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
        }),
      ],
    ])('should be rendered for a %s transaction', async (_, createTransaction) => {
      const transaction = createTransaction();

      await render({
        transaction,
      });

      expect(getIconTexts()).toContainEqual({
        icon: 'description',
        text: transaction.description,
      });
    });
  });

  describe('actions', () => {
    it('should render the list and the delete buttons', async () => {
      await render();

      const buttons = selector.listComponents(MatIconButton);

      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('format_list_bulleted');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('delete');
      expect(buttons[1].nativeElement.classList.contains('danger')).toBe(true);
    });

    describe('delete button', () => {
      const getDeleteButton = () => selector.getElementByTestId<HTMLButtonElement>('delete');

      it('should dispatch the delete event of the transaction if clicked', async () => {
        await render();

        getDeleteButton().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, transactionEvents.deleteTransaction(defaultTransaction), {
          scope: 'self',
        });
      });

      it('should be enabled if the transaction is not in progress', async () => {
        await render({
          isInProgress: [testDataFactory.transaction.id()],
        });

        expect(getDeleteButton().nativeElement.disabled).toBe(false);
      });

      it('should be disabled if the transaction is in progress', async () => {
        await render({
          isInProgress: [defaultTransaction.transactionId],
        });

        expect(getDeleteButton().nativeElement.disabled).toBe(true);
      });

      it('should not dispatch anything if clicked while the transaction is in progress', async () => {
        await render({
          isInProgress: [defaultTransaction.transactionId],
        });

        getDeleteButton().nativeElement.click();

        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('payment transaction', () => {
    it('should render the recipient, the project and the category', async () => {
      const transaction = testDataFactory.transaction.response.payment({
        issuedAt: issuedAtThisYear,
        recipient: testDataFactory.recipient.response(),
        project: testDataFactory.project.response(),
        category: testDataFactory.category.response({
          categoryType: CategoryType.Regular,
        }),
      });

      await render({
        transaction,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'store',
        text: transaction.recipient.name,
      });
      expect(iconTexts).toContainEqual({
        icon: 'stacks',
        text: transaction.project.name,
      });
      expect(iconTexts).toContainEqual({
        icon: 'category',
        text: transaction.category.fullName,
      });
    });

    it('should not render the recipient, the project and the category if they are missing', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          recipient: undefined,
          project: undefined,
          category: undefined,
        }),
      });

      const icons = getIconTexts().map(iconText => iconText.icon);

      expect(icons).not.toContain('store');
      expect(icons).not.toContain('stacks');
      expect(icons).not.toContain('category');
    });

    it('should not render the category among the additional details if it is not a regular one', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          category: testDataFactory.category.response({
            categoryType: CategoryType.Inventory,
          }),
        }),
      });

      const icons = getIconTexts().map(iconText => iconText.icon);

      expect(icons).not.toContain('category');
      expect(icons).not.toContain('inventory_2');
    });

    it('should render the product and the quantity of an inventory item', async () => {
      const transaction = testDataFactory.transaction.response.payment({
        issuedAt: issuedAtThisYear,
        category: testDataFactory.category.response({
          categoryType: CategoryType.Inventory,
        }),
        product: testDataFactory.product.response.generic(),
        quantity: 3,
      });

      await render({
        transaction,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'barcode',
        text: transaction.product.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'add_shopping_cart',
        text: '3',
      });
    });

    it('should not render the quantity if it is missing', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          product: testDataFactory.product.response.generic(),
          quantity: undefined,
        }),
      });

      expect(getIconTexts().map(iconText => iconText.icon)).not.toContain('add_shopping_cart');
    });

    it('should not render the product if it is missing', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          product: undefined,
          quantity: 3,
        }),
      });

      const icons = getIconTexts().map(iconText => iconText.icon);

      expect(icons).not.toContain('barcode');
      expect(icons).not.toContain('add_shopping_cart');
    });

    it('should render the invoice details of an invoice category', async () => {
      const transaction = testDataFactory.transaction.response.payment({
        issuedAt: issuedAtThisYear,
        category: testDataFactory.category.response({
          categoryType: CategoryType.Invoice,
        }),
        billingStartDate: '2025-01-01',
        billingEndDate: '2025-01-31',
        invoiceNumber: 'INV-1',
      });

      await render({
        transaction,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'receipt_long',
        text: transaction.category.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'calendar_month',
        text: `${formatDate('2025-01-01', 'yyyy. MMM dd.', 'en-US')} - ${formatDate('2025-01-31', 'yyyy. MMM dd.', 'en-US')}`,
      });
      expect(iconTexts).toContainEqual({
        icon: 'receipt',
        text: 'INV-1',
      });
    });

    it('should not render the invoice details of a non-invoice category', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          category: testDataFactory.category.response({
            categoryType: CategoryType.Regular,
          }),
          billingStartDate: '2025-01-01',
          billingEndDate: '2025-01-31',
          invoiceNumber: 'INV-1',
        }),
      });

      const icons = getIconTexts().map(iconText => iconText.icon);

      expect(icons).not.toContain('receipt_long');
      expect(icons).not.toContain('calendar_month');
      expect(icons).not.toContain('receipt');
    });

    it('should not render the billing period if one of its dates is missing', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          category: testDataFactory.category.response({
            categoryType: CategoryType.Invoice,
          }),
          billingStartDate: '2025-01-01',
          billingEndDate: undefined,
        }),
      });

      expect(getIconTexts().map(iconText => iconText.icon)).not.toContain('calendar_month');
    });

    it('should not render the invoice number if it is missing', async () => {
      await render({
        transaction: testDataFactory.transaction.response.payment({
          issuedAt: issuedAtThisYear,
          category: testDataFactory.category.response({
            categoryType: CategoryType.Invoice,
          }),
          invoiceNumber: undefined,
        }),
      });

      expect(getIconTexts().map(iconText => iconText.icon)).not.toContain('receipt');
    });
  });

  describe('loan transaction', () => {
    it('should render the paying account as a loan if the owner account is the account in the url', async () => {
      const payingAccount = testDataFactory.account.response({
        accountType: AccountType.Cash,
      });

      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount: accountOfUrl,
          payingAccount,
        }),
      });

      expect(getIconTextsIn('.loan')).toEqual([
        {
          icon: 'payments',
          text: payingAccount.name,
        },
      ]);
      expect(selector.getElementByCss('.repayment')).toBeFalsy();
    });

    it('should render the owner account as a repayment if the paying account is a loan account', async () => {
      const ownerAccount = testDataFactory.account.response({
        accountType: AccountType.Cash,
      });

      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount,
          payingAccount: testDataFactory.account.response({
            accountType: AccountType.Loan,
          }),
        }),
      });

      expect(getIconTextsIn('.repayment')).toEqual([
        {
          icon: 'payments',
          text: ownerAccount.name,
        },
      ]);
      expect(selector.getElementByCss('.loan')).toBeFalsy();
    });

    it('should render the owner account as a loan otherwise', async () => {
      const ownerAccount = testDataFactory.account.response({
        accountType: AccountType.CreditCard,
      });

      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount,
          payingAccount: testDataFactory.account.response({
            accountType: AccountType.BankAccount,
          }),
        }),
      });

      expect(getIconTextsIn('.loan')).toEqual([
        {
          icon: 'credit_card',
          text: ownerAccount.name,
        },
      ]);
      expect(selector.getElementByCss('.repayment')).toBeFalsy();
    });

    it('should render the paying account as a loan if the owner account is the account in the url, even if the paying account is a loan account', async () => {
      const payingAccount = testDataFactory.account.response({
        accountType: AccountType.Loan,
      });

      await render({
        transaction: testDataFactory.transaction.response.loan({
          issuedAt: issuedAtThisYear,
          ownerAccount: accountOfUrl,
          payingAccount,
        }),
      });

      expect(getIconTextsIn('.loan')).toEqual([
        {
          icon: 'request_quote',
          text: payingAccount.name,
        },
      ]);
      expect(selector.getElementByCss('.repayment')).toBeFalsy();
    });

    it('should render the product and the invoice details', async () => {
      const transaction = testDataFactory.transaction.response.loan({
        issuedAt: issuedAtThisYear,
        category: testDataFactory.category.response({
          categoryType: CategoryType.Invoice,
        }),
        product: testDataFactory.product.response.generic(),
        quantity: 2,
        billingStartDate: '2025-02-01',
        billingEndDate: '2025-02-28',
        invoiceNumber: 'INV-2',
      });

      await render({
        transaction,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'barcode',
        text: transaction.product.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'add_shopping_cart',
        text: '2',
      });
      expect(iconTexts).toContainEqual({
        icon: 'receipt_long',
        text: transaction.category.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'receipt',
        text: 'INV-2',
      });
    });

    it('should render the recipient, the project and the category', async () => {
      const transaction = testDataFactory.transaction.response.loan({
        issuedAt: issuedAtThisYear,
        recipient: testDataFactory.recipient.response(),
        project: testDataFactory.project.response(),
        category: testDataFactory.category.response({
          categoryType: CategoryType.Regular,
        }),
      });

      await render({
        transaction,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'store',
        text: transaction.recipient.name,
      });
      expect(iconTexts).toContainEqual({
        icon: 'stacks',
        text: transaction.project.name,
      });
      expect(iconTexts).toContainEqual({
        icon: 'category',
        text: transaction.category.fullName,
      });
    });
  });

  describe('transfer transaction', () => {
    it('should render the account and the transfer account', async () => {
      const transaction = testDataFactory.transaction.response.transfer({
        issuedAt: issuedAtThisYear,
        account: testDataFactory.account.response({
          accountType: AccountType.BankAccount,
        }),
        transferAccount: testDataFactory.account.response({
          accountType: AccountType.CreditCard,
        }),
      });

      await render({
        transaction,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'account_balance',
        text: transaction.account.name,
      });
      expect(iconTexts).toContainEqual({
        icon: 'credit_card',
        text: transaction.transferAccount.name,
      });
    });

    it('should render a negative arrow if the amount is negative', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: -100,
        }),
      });

      expect(selector.getElementByCss('.arrow').nativeElement.textContent.trim()).toBe('stat_minus_3');
    });

    it('should render a positive arrow if the amount is positive', async () => {
      await render({
        transaction: testDataFactory.transaction.response.transfer({
          issuedAt: issuedAtThisYear,
          amount: 100,
        }),
      });

      expect(selector.getElementByCss('.arrow').nativeElement.textContent.trim()).toBe('stat_3');
    });
  });

  describe('split transaction', () => {
    const splits = [
      {
        amount: -100,
      },
      {
        amount: -200,
      },
    ];

    it('should render the recipient', async () => {
      const transaction = testDataFactory.transaction.response.split({
        issuedAt: issuedAtThisYear,
        recipient: testDataFactory.recipient.response(),
      });

      await render({
        transaction,
      });

      expect(getIconTexts()).toContainEqual({
        icon: 'store',
        text: transaction.recipient.name,
      });
    });

    it('should render every split and loan if the transaction belongs to the account in the url', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: accountOfUrl,
          splits,
          loans: [
            {
              amount: -50,
            },
          ],
        }),
      });

      expect(getPanels().length).toBe(3);
    });

    it('should render only the loans of the account in the url if the transaction belongs to another account', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: otherAccount,
          splits,
          loans: [
            {
              amount: -50,
              ownerAccount: accountOfUrl,
            },
            {
              amount: -60,
              ownerAccount: testDataFactory.account.response(),
            },
          ],
        }),
      });

      expect(getPanels().length).toBe(1);
    });

    it('should render the amount, the currency and the owner account of a loan in the panel header', async () => {
      const ownerAccount = testDataFactory.account.response({
        accountType: AccountType.Cash,
      });

      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: testDataFactory.account.response({
            accountId,
            currency: 'HUF',
          }),
          splits: [],
          loans: [
            {
              amount: -50,
              ownerAccount,
            },
          ],
        }),
      });

      expect(getPanels()[0].nativeElement.textContent).toContain('-50 HUF');
      expect(getIconTexts()).toContainEqual({
        icon: 'payments',
        text: ownerAccount.name,
      });
    });

    it('should render the amount of every split in red', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: accountOfUrl,
          splits,
          loans: [],
        }),
      });

      const titles = selector.listComponents(MatExpansionPanelTitle);

      expect(titles.length).toBe(splits.length);
      titles.forEach((title) => {
        expect(title.nativeElement.classList.contains('red-text')).toBe(true);
      });
    });

    it('should not render an owner account for the splits', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: accountOfUrl,
          splits,
          loans: [],
        }),
      });

      expect(selector.getElementByCss('.loan')).toBeFalsy();
    });

    it('should render the owner account of the loans in the panel header', async () => {
      const ownerAccount = testDataFactory.account.response({
        accountType: AccountType.Cafeteria,
      });

      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: accountOfUrl,
          splits: [],
          loans: [
            {
              amount: -50,
              ownerAccount,
            },
          ],
        }),
      });

      expect(getIconTextsIn('.loan')).toEqual([
        {
          icon: 'restaurant',
          text: ownerAccount.name,
        },
      ]);
    });

    it('should render zero as amount if the transaction belongs to another account and none of its loans belong to the account in the url', async () => {
      await render({
        transaction: testDataFactory.transaction.response.split({
          issuedAt: issuedAtThisYear,
          account: testDataFactory.account.response({
            currency: 'HUF',
          }),
          splits,
          loans: [
            {
              amount: -25,
              ownerAccount: otherAccount,
            },
          ],
        }),
      });

      expect(getAmount().nativeElement.textContent.trim()).toBe(formatAmount(0, 'HUF'));
      expect(getPanels().length).toBe(0);
    });

    it('should render the product and the invoice details of a split in the panel', async () => {
      const split = testDataFactory.transaction.response.split({
        issuedAt: issuedAtThisYear,
        account: accountOfUrl,
        splits: [
          {
            amount: -100,
            category: testDataFactory.category.response({
              categoryType: CategoryType.Invoice,
            }),
            product: testDataFactory.product.response.generic(),
            quantity: 4,
            billingStartDate: '2025-03-01',
            billingEndDate: '2025-03-31',
            invoiceNumber: 'INV-3',
          },
        ],
        loans: [],
      });

      await render({
        transaction: split,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'barcode',
        text: split.splits[0].product.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'add_shopping_cart',
        text: '4',
      });
      expect(iconTexts).toContainEqual({
        icon: 'receipt_long',
        text: split.splits[0].category.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'calendar_month',
        text: `${formatDate('2025-03-01', 'yyyy. MMM dd.', 'en-US')} - ${formatDate('2025-03-31', 'yyyy. MMM dd.', 'en-US')}`,
      });
      expect(iconTexts).toContainEqual({
        icon: 'receipt',
        text: 'INV-3',
      });
    });

    it('should render the details of a split in the panel', async () => {
      const split = testDataFactory.transaction.response.split({
        issuedAt: issuedAtThisYear,
        account: accountOfUrl,
        splits: [
          {
            amount: -100,
            description: 'split description',
            category: testDataFactory.category.response({
              categoryType: CategoryType.Regular,
            }),
            project: testDataFactory.project.response(),
          },
        ],
        loans: [],
      });

      await render({
        transaction: split,
      });

      const iconTexts = getIconTexts();

      expect(iconTexts).toContainEqual({
        icon: 'description',
        text: 'split description',
      });
      expect(iconTexts).toContainEqual({
        icon: 'category',
        text: split.splits[0].category.fullName,
      });
      expect(iconTexts).toContainEqual({
        icon: 'stacks',
        text: split.splits[0].project.name,
      });
    });
  });
});
