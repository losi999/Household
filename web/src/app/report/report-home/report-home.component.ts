import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Account, Category, Product, Project, Recipient, Report, Transaction } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { selectAccounts } from '@household/web/state/account/account.selector';
import { ReportCatalogItemFilterValue } from '@household/web/app/report/report-catalog-item-filter/report-catalog-item-filter.component';
import { ReportDateRangeFilterValue } from '@household/web/app/report/report-date-range-filter/report-date-range-filter.component';
import { GroupBy } from '@household/web/app/report/report-list/report-list.component';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectCategories } from '@household/web/state/category/category.selector';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectProjects } from '@household/web/state/project/project.selector';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';
import { TransactionService } from '@household/web/services/transaction.service';

const oneFilterRequiredValidator: ValidatorFn = (control) => {
  return Object.values(control.value).every(v => !v || Object.keys(v).length === 0) ? {
    minimumProperties: true,
  } : null;
};

export type ProductFlatTree = {
  key: Product.Id;
  value: string;
  parent?: string
};

type GroupCriteria ={
  key: GroupBy;
  value: string;
  isSelected: boolean
};

@Component({
  selector: 'household-report-home',
  templateUrl: './report-home.component.html',
  styleUrl: './report-home.component.scss',
  standalone: false,
})
export class ReportHomeComponent implements OnInit, OnDestroy {
  private destroyed = new Subject<void>();
  accounts = this.store.select(selectAccounts);
  projects = this.store.select(selectProjects);
  recipients = this.store.select(selectRecipients);
  categories = this.store.select(selectCategories);

  products: ProductFlatTree[];
  form: FormGroup<{
    issuedAt: FormControl<ReportDateRangeFilterValue[]>;
    accounts: FormControl<ReportCatalogItemFilterValue<Account.Id>>;
    projects: FormControl<ReportCatalogItemFilterValue<Project.Id>>;
    recipients: FormControl<ReportCatalogItemFilterValue<Recipient.Id>>;
    categories: FormControl<ReportCatalogItemFilterValue<Category.Id>>;
    products: FormControl<ReportCatalogItemFilterValue<Product.Id>>;
  }>;
  report: Transaction.Report[];

  constructor(private transactionService: TransactionService,
    private store: Store) {
  }
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.store.dispatch(projectApiActions.listProjectsInitiated());
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
    // this.store.dispatch(accountApiActions.retrievedAccountList());

    this.form = new FormGroup({
      issuedAt: new FormControl([]),
      accounts: new FormControl(),
      recipients: new FormControl(),
      products: new FormControl(),
      projects: new FormControl(),
      categories: new FormControl(),
    }, [oneFilterRequiredValidator]);

    // this.store_.inventoryCategories.pipe(takeUntil(this.destroyed)).subscribe((categories) => {
    //   this.products = categories.flatMap<ProductFlatTree>(category => {
    //     if (!category.products?.length) {
    //       return [];
    //     }

    //     return category.products?.map<ProductFlatTree>(p => {
    //       return {
    //         key: p.productId,
    //         value: p.fullName,
    //         parent: category.fullName,
    //       };
    //     });
    //   });
    // });
  }

  displayRange(range: ReportDateRangeFilterValue) {
    if (range.include) {
      if (range.from && range.to) {
        return `${range.from.toLocaleDateString()} és ${range.to.toLocaleDateString()} között`;
      }
      if (range.from) {
        return `${range.from.toLocaleDateString()} után`;
      }
      if (range.to) {
        return `${range.to.toLocaleDateString()} előtt`;
      }
    } else {
      if (range.from && range.to) {
        return `${range.from.toLocaleDateString()} előtt vagy ${range.to.toLocaleDateString()} után`;
      }
      if (range.from) {
        return `${range.from.toLocaleDateString()} előtt`;
      }
      if (range.to) {
        return `${range.to.toLocaleDateString()} után`;
      }
    }
    return new Date(range.to).toLocaleDateString();
  }

  deleteIssuedAtRange(index: number) {
    const temp = [...this.form.value.issuedAt];
    temp.splice(index, 1);
    this.form.controls.issuedAt.setValue(temp);
  }

  issuedAtRangeAdded(event: ReportDateRangeFilterValue) {
    this.form.controls.issuedAt.patchValue([
      ...this.form.value.issuedAt,
      event,
    ]);
  }

  onSubmit() {
    if (this.form.valid) {
      const request: Report.Request = this.form.value.issuedAt.map(v => ({
        filterType: 'issuedAt',
        include: v.include,
        from: v.from?.toISOString(),
        to: v.to?.toISOString(),
      }));

      if (this.form.value.accounts) {
        request.push({
          filterType: 'account',
          ...this.form.value.accounts,
        });
      }
      if (this.form.value.projects) {
        request.push({
          filterType: 'project',
          ...this.form.value.projects,
        });
      }
      if (this.form.value.recipients) {
        request.push({
          filterType: 'recipient',
          ...this.form.value.recipients,
        });
      }
      if (this.form.value.categories) {
        request.push({
          filterType: 'category',
          ...this.form.value.categories,
        });
      }
      if (this.form.value.products) {
        request.push({
          filterType: 'product',
          ...this.form.value.products,
        });
      }

      this.transactionService.getTransactionReport(request).subscribe((value) => {
        this.report = value;
      });
    }
  }

  groupCriterias: GroupCriteria[] = [
    // {
    //   key: 'year',
    //   value: 'Év',
    //   isSelected: false,
    // },
    // {
    //   key: 'month',
    //   value: 'Hónap',
    //   isSelected: false,
    // },
    // {
    //   key: 'day',
    //   value: 'Nap',
    //   isSelected: false,
    // },
    {
      key: 'account',
      value: 'Számla',
      isSelected: false,
    },
    {
      key: 'project',
      value: 'Projekt',
      isSelected: false,
    },
    {
      key: 'recipient',
      value: 'Partner',
      isSelected: false,
    },
    {
      key: 'category',
      value: 'Kategória',
      isSelected: false,
    },
    {
      key: 'product',
      value: 'Termék',
      isSelected: false,
    },
  ];
  selectedGroups = [];

  clickGroup(groupCriteria: GroupCriteria) {
    groupCriteria.isSelected = !groupCriteria.isSelected;
    const fromIndex = this.groupCriterias.findIndex(g => g.key === groupCriteria.key);
    const toIndex = this.groupCriterias.filter(g => g.isSelected).length;
    if (groupCriteria.isSelected) {
      moveItemInArray(this.groupCriterias, fromIndex, toIndex - 1);
    } else {
      moveItemInArray(this.groupCriterias, fromIndex, toIndex);
    }
    this.selectedGroups = this.groupCriterias.filter(g => g.isSelected).map(g => g.key);
  }

  dropGroup(event: CdkDragDrop<GroupCriteria[]>) {
    const groupCriteria = this.groupCriterias[event.currentIndex];
    if (groupCriteria.isSelected) {
      moveItemInArray(this.groupCriterias, event.previousIndex, event.currentIndex);
      this.selectedGroups = this.groupCriterias.filter(g => g.isSelected).map(g => g.key);
    }
  }
}
