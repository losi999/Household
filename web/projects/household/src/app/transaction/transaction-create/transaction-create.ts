import { Component, computed, effect, inject, signal } from '@angular/core';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { form, required, FormField, validate } from '@angular/forms/signals';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatButtonModule } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';
import { AccountStore } from '@household/state/account/account-store';
import { ActivatedRoute } from '@angular/router';
import { Api } from '@household/shared/types/api';
import { IconText, AmountInput, ClearableInput } from '@household/shared-ui';
import { AccountTypeIconPipe } from '@household/app/account/account-type-icon-pipe';
import { MatIconModule } from '@angular/material/icon';
import { injectDispatch } from '@ngrx/signals/events';
import { accountEvents } from '@household/state/account/account-events';
import { MatMenuModule } from '@angular/material/menu';
import { AccountType } from '@household/shared/enums';
import { recipientEvents } from '@household/state/recipient/recipient-events';
import { categoryEvents } from '@household/state/category/category-events';
import { productEvents } from '@household/state/product/product-events';
import { projectEvents } from '@household/state/project/project-events';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { ProjectStore } from '@household/state/project/project-store';
import { CategoryStore } from '@household/state/category/category-store';
import { ProductStore } from '@household/state/product/product-store';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';

type AccountsModel = {
  account: Responses.Account;
  transferAccount: Responses.Account;
  loanAccount: Responses.Account;
};

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
  private readonly recipientStore = inject(RecipientStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly categoryStore = inject(CategoryStore);
  private readonly productStore = inject(ProductStore);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly accountEvents = injectDispatch(accountEvents);
  private readonly recipientEvents = injectDispatch(recipientEvents);
  private readonly categoryEvents = injectDispatch(categoryEvents);
  private readonly projectEvents = injectDispatch(projectEvents);
  private readonly productEvents = injectDispatch(productEvents);
  
  private readonly accountId = this.activatedRoute.snapshot.paramMap.get('accountId') as Api.Account.Id;
  private accountSelectionType: keyof AccountsModel;

  readonly stepIcon = [
    'today',
    'account_balance',
    'attach_money',
    'menu_book',
    'fact_check',
  ];

  issuedAtModel = signal<{
    date: Date;
    time: Date;
  }>({
    date: new Date(),
    time: new Date(),
  });

  issuedAtForm = form(this.issuedAtModel, (schemaPath) => {
    required(schemaPath.date, {
      message: 'Kötelező',
    });
    required(schemaPath.time, {
      message: 'Kötelező',
    });
  });

  accountsModel = signal<AccountsModel>({
    account: null,
    loanAccount: null,
    transferAccount: null,
  });

  accountsForm = form(this.accountsModel, (schemaPath) => {
    required(schemaPath.account, {
      message: 'Kötelező',
    });
  });

  amountModel = signal<{
    amount: number;
    transferAmount: number;}>({
    amount: 0,
    transferAmount: 0,
  });

  amountForm = form(this.amountModel, (schemaPath) => {
    required(schemaPath.amount, {
      message: 'Kötelező',
    });
    required(schemaPath.transferAmount, {
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

  detailsModel = signal<{
    description: string;
    category: Responses.Category;
    recipient: Responses.Recipient;
    product: Responses.Product;
    project: Responses.Project;
  }>({
    category: null,
    description: null,
    product: null,
    project: null,
    recipient: null,
  });

  detailsForm = form(this.detailsModel);

  isDownwardTransaction = signal(true);
  isTransferTransaction = computed(() => !!this.accountsForm().value().transferAccount);
  isDifferentCurrencyTransfer = computed(() => this.isTransferTransaction() && this.accountsForm().value().transferAccount.currency !== this.accountsForm().value().account.currency);

  constructor() {
    effect(() => {
      const account = this.accountStore.accountList().find(a => a.accountId === this.accountId);

      this.accountsModel.update((prev) => {
        return {
          ...prev,
          account,
        };
      });
    });

    effect(() => {
      const selected = this.accountStore.selectedAccount();

      if (selected) {
        this.accountsModel.update((prev) => {
          return {
            ...prev,
            [this.accountSelectionType]: selected,
          };
        });
      }
    });

    effect(() => {
      const selected = this.recipientStore.selectedRecipient();

      if (selected) {
        this.detailsModel.update((prev) => {
          return {
            ...prev,
            recipient: selected,
          };
        });
      }
    });

    effect(() => {
      const selected = this.projectStore.selectedProject();

      if (selected) {
        this.detailsModel.update((prev) => {
          return {
            ...prev,
            project: selected,
          };
        });
      }
    });

    effect(() => {
      const selected = this.categoryStore.selectedCategory();

      if (selected) {
        this.detailsModel.update((prev) => {
          return {
            ...prev,
            category: selected,
          };
        });
      }
    });

    effect(() => {
      const selected = this.productStore.selectedProduct();

      if (selected) {
        this.detailsModel.update((prev) => {
          return {
            ...prev,
            product: selected,
          };
        });
      }
    });
  }

  onSelectAccount(type: keyof AccountsModel) {
    this.accountSelectionType = type;
    
    switch(type) {
      case 'loanAccount': {
        const isPayingAccountLoan = this.accountsForm().value().account.accountType === AccountType.Loan;

        this.accountEvents.selectAccount(this.accountStore.accountList().filter(a => {
          
          return ((a.accountType === AccountType.Loan) !== isPayingAccountLoan) && a.currency === this.accountsForm().value().account.currency;
        }));
      } break;
      case 'transferAccount': {
        this.accountEvents.selectAccount(this.accountStore.accountList().filter(a => {
          return a.accountId !== this.accountsForm().value().account.accountId;
        }));
      } break;
      case 'account': {
        const loanAccount = this.accountsForm().value().loanAccount;
        const isLoanAccountLoanType = loanAccount?.accountType === AccountType.Loan;

        this.accountEvents.selectAccount(this.accountStore.accountList().filter(a => {
          if (!loanAccount) {
            return a.accountId !== this.accountsForm().value().transferAccount?.accountId;
          }

          return ((a.accountType === AccountType.Loan) !== isLoanAccountLoanType && a.currency === loanAccount.currency);          
        }));
      } break;
    }
  }

  onSwitchAccounts() {
    this.accountsModel.update((prev) => {
      if (prev.loanAccount) {
        return {
          account: prev.loanAccount,
          loanAccount: prev.account,
          transferAccount: undefined,
        };
      }
      if (prev.transferAccount) {
        return {
          account: prev.transferAccount,
          transferAccount: prev.account,
          loanAccount: undefined,
        };
      }

      return prev;
    });
  }

  onSwitchTransferDirection() {
    this.isDownwardTransaction.update((previous) => !previous);
  }

  onSelectRecipient() {
    this.recipientEvents.selectRecipient(undefined);
  }

  onRemoveRecipient() {
    this.detailsModel.update((prev) => {
      return {
        ...prev,
        recipient: null,
      };
    });
  }

  onSelectProject() {
    this.projectEvents.selectProject(undefined);
  }

  onRemoveProject() {
    this.detailsModel.update((prev) => {
      return {
        ...prev,
        project: null,
      };
    });
  }

  onSelectCategory() {
    this.categoryEvents.selectCategory(undefined);
  }

  onRemoveCategory() {
    this.detailsModel.update((prev) => {
      return {
        ...prev,
        category: null,
      };
    });
  }

  onSelectProduct() {
    this.productEvents.selectProduct(undefined);
  }

  onRemoveProduct() {
    this.detailsModel.update((prev) => {
      return {
        ...prev,
        product: null,
      };
    });
  }

  onRemoveAccount(type: keyof AccountsModel) {
    this.accountsModel.update((prev) => {
      return {
        ...prev,
        [type]: null,
      };
    });
  }

  onAmountNext() {
    Object.values(this.amountForm).forEach(field => {
      field().markAsTouched();
    });
  }
}
