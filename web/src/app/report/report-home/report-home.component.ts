import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Category, Product, Project, Recipient, Report } from '@household/shared/types/types';
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
  accounts: Account.Response[];
  projects: Project.Response[];
  recipients: Recipient.Response[];
  categories: Category.Response[];
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

  constructor(private activatedRoute: ActivatedRoute, private transactionService: TransactionService, private router: Router) { }

  ngOnInit(): void {
    this.accounts = this.activatedRoute.snapshot.data.accounts;
    this.projects = this.activatedRoute.snapshot.data.projects;
    this.recipients = this.activatedRoute.snapshot.data.recipients;
    this.categories = this.activatedRoute.snapshot.data.categories;
    this.products = this.categories.reduce<ProductFlatTree[]>((accumulator, currentValue) => {
      if (currentValue.categoryType !== 'inventory' || !currentValue.products?.length) {
        return accumulator;
      }

      return [
        ...accumulator,
        ...currentValue.products?.map<ProductFlatTree>(p => {
          return {
            key: p.productId,
            value: p.fullName,
            parent: currentValue.fullName,
          };
        }) ?? [],
      ];
    }, []);

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
