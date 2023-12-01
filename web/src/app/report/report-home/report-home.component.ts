import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';

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
    accountIds: FormControl<Account.Id[]>;
    categoryIds: FormControl<Category.Id[]>;
    projectIds: FormControl<Project.Id[]>;
    recipientIds: FormControl<Recipient.Id[]>;
    productIds: FormControl<Product.Id[]>;
  }>;

  constructor(private activatedRoute: ActivatedRoute) { }

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
        // {
        //   key: currentValue.categoryId,
        //   value: currentValue.fullName,
        // },
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
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
