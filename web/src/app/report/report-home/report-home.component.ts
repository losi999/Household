import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Report } from '@household/shared/types/types';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/account/account.service';
import { CategoryService } from 'src/app/category/category.service';
import { ProjectService } from 'src/app/project/project.service';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { Store } from 'src/app/store';
import { TransactionService } from 'src/app/transaction/transaction.service';

type ProductFlatTree = {
  key: Product.Id;
  value: string;
  parent?: string
};

@Component({
  selector: 'household-report-home',
  templateUrl: './report-home.component.html',
  styleUrl: './report-home.component.scss',
})
export class ReportHomeComponent implements OnInit {
  get accounts(): Observable< Account.Response[]> {
    return this.store.accounts.asObservable();
  }
  get projects(): Observable< Project.Response[]> {
    return this.store.projects.asObservable();
  }
  get recipients(): Observable< Recipient.Response[]> {
    return this.store.recipients.asObservable();
  }
  get categories(): Observable< Category.Response[]> {
    return this.store.categories.asObservable();
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
    private router: Router) {
    accountService.listAccounts();
    categoryService.listCategories();
    projectService.listProjects();
    recipientService.listRecipients();
  }

  ngOnInit(): void {
    // this.products = this.categories.reduce<ProductFlatTree[]>((accumulator, currentValue) => {
    //   if (currentValue.categoryType !== 'inventory' || !currentValue.products?.length) {
    //     return accumulator;
    //   }

    //   return [
    //     ...accumulator,
    //     ...currentValue.products?.map<ProductFlatTree>(p => {
    //       return {
    //         key: p.productId,
    //         value: p.fullName,
    //         parent: currentValue.fullName,
    //       };
    //     }) ?? [],
    //   ];
    // }, []);

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
}
