import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Report } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { CategoryService } from 'src/app/category/category.service';
import { ProjectService } from 'src/app/project/project.service';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { DialogService } from 'src/app/shared/dialog.service';
import { Store } from 'src/app/store';
import { TransactionService } from 'src/app/transaction/transaction.service';

export type ProductFlatTree = {
  key: Product.Id;
  value: string;
  parent?: string
};

@Component({
  selector: 'household-report-home',
  templateUrl: './report-home.component.html',
  styleUrl: './report-home.component.scss',
})
export class ReportHomeComponent implements OnInit, OnDestroy {
  private destroyed = new Subject<void>();
  get accounts(): Account.Response[] {
    return this.store.accounts.value;
  }
  get projects(): Project.Response[] {
    return this.store.projects.value;
  }
  get recipients(): Recipient.Response[] {
    return this.store.recipients.value;
  }
  get categories(): Category.Response[] {
    return this.store.categories.value;
  }
  products: ProductFlatTree[];
  form: FormGroup<{
    issuedAtFrom: FormControl<Date>;
    issuedAtTo: FormControl<Date>;
    accountIds: FormControl<Account.Id[]>;
    categoryIds: FormControl<Category.Id[]>;
    projectIds: FormControl<Project.Id[]>;
    recipientIds: FormControl<Recipient.Id[]>;
    productIds: FormControl<Product.Id[]>;
  }>;

  constructor(private store: Store, private transactionService: TransactionService,
    accountService: AccountService,
    categoryService: CategoryService,
    projectService: ProjectService,
    recipientService: RecipientService,
    private dialogService: DialogService,
    private router: Router) {
    accountService.listAccounts();
    categoryService.listCategories();
    projectService.listProjects();
    recipientService.listRecipients();
  }
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.store.inventoryCategories.pipe(takeUntil(this.destroyed)).subscribe((categories) => {
      this.products = categories.flatMap<ProductFlatTree>(category => {
        if (!category.products?.length) {
          return [];
        }

        return category.products?.map<ProductFlatTree>(p => {
          return {
            key: p.productId,
            value: p.fullName,
            parent: category.fullName,
          };
        });
      });
    });

    this.form = new FormGroup({
      accountIds: new FormControl(),
      categoryIds: new FormControl(),
      projectIds: new FormControl(),
      recipientIds: new FormControl(),
      productIds: new FormControl(),
      issuedAtFrom: new FormControl(),
      issuedAtTo: new FormControl(new Date()),
    });
  }

  onSubmit() {
    const request: Report.Request = {
      accountIds: this.form.value.accountIds ?? undefined,
      categoryIds: this.form.value.categoryIds ?? undefined,
      productIds: this.form.value.productIds ?? undefined,
      projectIds: this.form.value.projectIds ?? undefined,
      recipientIds: this.form.value.recipientIds ?? undefined,
      issuedAtFrom: this.form.value.issuedAtFrom?.toISOString(),
      issuedAtTo: this.form.value.issuedAtTo?.toISOString(),
    };

    this.transactionService.getTransactionReport(request).subscribe((value) => {
      console.log(value);
    });
  }

  filterAccounts() {
    const dialogRef = this.dialogService.openAccountFilterDialog(this.accounts);

    dialogRef.afterClosed().subscribe({
      next: (value) => {
        this.form.patchValue({
          accountIds: value,
        });
      },
    });
  }

  filterRecipients() {
    const dialogRef = this.dialogService.openRecipientFilterDialog(this.recipients);

    dialogRef.afterClosed().subscribe({
      next: (value) => {
        this.form.patchValue({
          recipientIds: value,
        });
      },
    });
  }

  filterProjects() {
    const dialogRef = this.dialogService.openProjectFilterDialog(this.projects);

    dialogRef.afterClosed().subscribe({
      next: (value) => {
        this.form.patchValue({
          projectIds: value,
        });
      },
    });
  }

  filterCategories() {
    const dialogRef = this.dialogService.openCategoryFilterDialog(this.categories);

    dialogRef.afterClosed().subscribe({
      next: (value) => {
        this.form.patchValue({
          categoryIds: value,
        });
      },
    });
  }

  filterProducts() {
    const dialogRef = this.dialogService.openProductFilterDialog(this.products);

    dialogRef.afterClosed().subscribe({
      next: (value) => {
        this.form.patchValue({
          productIds: value,
        });
      },
    });
  }

}
