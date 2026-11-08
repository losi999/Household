import { Component, computed, effect, inject, signal } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { form, required, FormField, validate, min } from '@angular/forms/signals';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatButtonModule } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';
import { AccountStore } from '@household/state/account/account-store';
import { ActivatedRoute } from '@angular/router';
import { Api } from '@household/shared/types/api';
import { IconText, AmountInput, ClearableInput, ProgressStore, SelectionStore } from '@household/shared-ui';
import { AccountTypeIconPipe } from '@household/app/account/account-type-icon-pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AccountType, CategoryType } from '@household/shared/enums';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { ProjectStore } from '@household/state/project/project-store';
import { CategoryStore } from '@household/state/category/category-store';
import { ProductStore } from '@household/state/product/product-store';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { AccountSelector } from '@household/app/account/account-selector/account-selector';
import { ProjectSelector } from '@household/app/project/project-selector/project-selector';
import { RecipientSelector } from '@household/app/recipient/recipient-selector/recipient-selector';
import { CategorySelector } from '@household/app/category/category-selector/category-selector';
import { ProductSelector } from '@household/app/product/product-selector/product-selector';

@Component({
  imports: [
    Toolbar,
    MatStepperModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatInputModule,
    FormField,
    JsonPipe,
    MatButtonModule,
    IconText,
    AccountTypeIconPipe,
    MatIconModule,
    MatMenuModule,
    AmountInput,
    DecimalPipe,
    ClearableInput,
    AccountSelector,
    ProjectSelector,
    RecipientSelector,
    CategorySelector,
    ProductSelector,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {
        displayDefaultIndicatorType: false,
      },
    },
  ],
  selector: 'household-transaction-create',
  styleUrl: './transaction-create.scss',
  templateUrl: './transaction-create.html',
})
export class TransactionCreate {
  private readonly accountStore = inject(AccountStore);
  readonly recipientStore = inject(RecipientStore);
  readonly projectStore = inject(ProjectStore);
  readonly selectionStore = inject(SelectionStore);
  readonly categoryStore = inject(CategoryStore);
  readonly productStore = inject(ProductStore);
  readonly progressStore = inject(ProgressStore);
  private readonly activatedRoute = inject(ActivatedRoute);
  
  private readonly accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Api.Account.Id;

  transactionModel = signal<{
    date: Date;
    time: Date;
    account: Responses.Account;
    transferAccount: Responses.Account;
    loanAccount: Responses.Account;
    amount: number;
    transferAmount: number;
    description: string;
    category: Responses.Category;
    recipient: Responses.Recipient;
    product: Responses.Product;
    project: Responses.Project;
    quantity: number;
    invoiceNumber: string;
    billingStartDate: Date;
    billingEndDate: Date;
  }>({
    date: new Date(),
    time: new Date(),
    account: null,
    loanAccount: null,
    transferAccount: null,
    amount: null,
    transferAmount: null,
    category: null,
    description: null,
    product: null,
    project: null,
    recipient: null,
    quantity: null,
    invoiceNumber: null,
    billingStartDate: null,
    billingEndDate: null,
  });

  transactionForm = form(this.transactionModel, (schemaPath) => {
    required(schemaPath.date, {
      message: 'Kötelező',
    });
    required(schemaPath.time, {
      message: 'Kötelező',
    });
    required(schemaPath.account, {
      message: 'Kötelező',
    });
    required(schemaPath.amount, {
      message: 'Kötelező',
    });
    required(schemaPath.transferAmount, {
      when: () => this.isDifferentCurrencyTransfer(),
      message: 'Kötelező',
    });
    validate(schemaPath.amount, ({ value }) => {
      return value() === 0 ? {
        kind: 'nonZero',
        message: 'Összeg nem lehet nulla', 
      }
        : null;
    });
    validate(schemaPath.transferAmount, ({ value }) => {
      return this.isDifferentCurrencyTransfer() && value() === 0 ? {
        kind: 'nonZero',
        message: 'Összeg nem lehet nulla', 
      }
        : null;
    });
  });

  // detailsForm = form(this.detailsModel, (schemaPath) => {
  //   validate(schemaPath.quantity, ({ value }) => {
  //     const quantity = value();

  //     return quantity !== null && quantity <= 0 ? {
  //       kind: 'positive',
  //       message: 'Nullánál nagyobbnak kell lennie', 
  //     } : null;
  //   });

  //   required(schemaPath.billingStartDate, {
  //     // when: ({ valueOf }) => !!valueOf(schemaPath.invoiceNumber) || !!valueOf(schemaPath.billingEndDate),
  //     message: 'Kötelező',
  //   });

  //   required(schemaPath.billingEndDate, {
  //     // when: ({ valueOf }) => !!valueOf(schemaPath.invoiceNumber) || !!valueOf(schemaPath.billingStartDate),
  //     message: 'Kötelező',
  //   });
  // });

  isDownwardTransaction = signal(true);
  isTransferTransaction = computed(() => !!this.transactionForm().value().transferAccount);
  isDifferentCurrencyTransfer = computed(() => this.isTransferTransaction() && this.transactionForm().value().transferAccount.currency !== this.transactionForm().value().account.currency);

  selectableAccounts = computed(() => {
    const loanAccount = this.transactionForm().value().loanAccount;
    const isLoanAccountLoanType = loanAccount?.accountType === AccountType.Loan;

    const accounts = this.accountStore.accountList().filter(a => {
      if (!loanAccount) {
        return a.accountId !== this.transactionForm().value().transferAccount?.accountId;
      }

      return ((a.accountType === AccountType.Loan) !== isLoanAccountLoanType && a.currency === loanAccount.currency);          
    });
    return accounts;
  });

  selectableTransferAccounts = computed(() => {
    const accounts = this.accountStore.accountList().filter(a => {
      return a.accountId !== this.transactionForm().value().account.accountId;
    });
    return accounts;
  });

  selectableLoanAccounts = computed(() => {
    if (!this.transactionForm().value().account) {
      return [];
    }
    
    const isPayingAccountLoan = this.transactionForm().value().account.accountType === AccountType.Loan;

    const accounts = this.accountStore.accountList().filter(a => {
          
      return ((a.accountType === AccountType.Loan) !== isPayingAccountLoan) && a.currency === this.transactionForm().value().account.currency;
    });
    return accounts;
  });

  constructor() {
    effect(() => {
      // A form field whose value is undefined does not exist in the form, so a missing account must be null
      const account = this.accountStore.accountList().find(a => a.accountId === this.accountId) ?? null;

      this.transactionModel.update((prev) => {
        return {
          ...prev,
          account,
        };
      });
    });

    effect(() => {
      const selected = this.transactionForm.category().value();

      if (selected) {
        this.transactionModel.update((prev) => {
          return {
            ...prev,
            product: selected.categoryType !== CategoryType.Inventory ? null : prev.product,
            quantity: selected.categoryType !== CategoryType.Inventory ? null : prev.quantity,
            invoiceNumber: selected.categoryType !== CategoryType.Invoice ? null : prev.invoiceNumber,
            billingEndDate: selected.categoryType !== CategoryType.Invoice ? null : prev.billingEndDate,
            billingStartDate: selected.categoryType !== CategoryType.Invoice ? null : prev.billingStartDate,
          };
        });
      } else {
        this.transactionModel.update((prev) => {
          return {
            ...prev,
            product: null,
            quantity: null,
            invoiceNumber: null,
            billingEndDate: null,
            billingStartDate: null,
          };
        });
      }
    });

    effect(() => {
      const selected = this.transactionForm.product().value();

      if (selected) {
        const inventoryCategory = this.categoryStore.categoryList().find(c => c.categoryType === CategoryType.Inventory);
        this.transactionModel.update((prev) => {
          return {
            ...prev,
            category: inventoryCategory,
          };
        });
      }
    });
  }

  onSwitchAccounts() {
    this.transactionModel.update((prev) => {
      if (prev.loanAccount) {
        return {
          ...prev,
          account: prev.loanAccount,
          loanAccount: prev.account,
          transferAccount: null,
        };
      }
      if (prev.transferAccount) {
        return {
          ...prev,
          account: prev.transferAccount,
          transferAccount: prev.account,
          loanAccount: null,
        };
      }

      return prev;
    });
  }

  onSwitchTransferDirection() {
    this.isDownwardTransaction.update((previous) => !previous);
  }
}
