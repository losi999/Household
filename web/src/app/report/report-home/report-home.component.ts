import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Account, Category, Product, Project, Recipient, Report, Transaction } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { map, Observable, Subject } from 'rxjs';
import { selectAccounts } from '@household/web/state/account/account.selector';
import { Node, ReportCatalogItemFilterValue } from '@household/web/app/report/report-catalog-item-filter/report-catalog-item-filter.component';
import { ReportDateRangeFilterValue } from '@household/web/app/report/report-date-range-filter/report-date-range-filter.component';
import { GroupBy } from '@household/web/app/report/report-list/report-list.component';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectCategories } from '@household/web/state/category/category.selector';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectProjects } from '@household/web/state/project/project.selector';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { selectRecipients } from '@household/web/state/recipient/recipient.selector';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectGroupedProducts } from '@household/web/state/product/product.selector';
import { productApiActions } from '@household/web/state/product/product.actions';
import { transactionApiActions } from '@household/web/state/transaction/transaction.actions';

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
  accounts: Observable<Node[]>;
  projects: Observable<Node[]>;
  recipients: Observable<Node[]>;
  categories: Observable<Node[]>;
  products: Observable<Node[]>;

  form: FormGroup<{
    issuedAt: FormControl<ReportDateRangeFilterValue[]>;
    accounts: FormControl<ReportCatalogItemFilterValue<Account.Id>>;
    projects: FormControl<ReportCatalogItemFilterValue<Project.Id>>;
    recipients: FormControl<ReportCatalogItemFilterValue<Recipient.Id>>;
    categories: FormControl<ReportCatalogItemFilterValue<Category.Id>>;
    products: FormControl<ReportCatalogItemFilterValue<Product.Id>>;
  }>;
  report: Transaction.Report[];

  constructor(private store: Store) {
  }
  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.accounts = this.store.select(selectAccounts).pipe(map((accounts) => {
      return accounts.map<Node>(r => {
        return {
          id: r.accountId,
          name: r.fullName,
          children: undefined,
        };
      });
    }));

    this.projects = this.store.select(selectProjects).pipe(map((projects) => {
      return projects.map<Node>(r => {
        return {
          id: r.projectId,
          name: r.name,
          children: undefined,
        };
      });
    }));
    this.recipients = this.store.select(selectRecipients).pipe(map((recipients) => {
      return recipients.map<Node>(r => {
        return {
          id: r.recipientId,
          name: r.name,
          children: undefined,
        };
      });
    }));

    this.categories = this.store.select(selectCategories).pipe(map((categories) => {
      const categoryMap: {
        [categoryId: Category.Id]: Node;
      } = {};

      return categories.reduce<Node[]>((accumulator, currentValue) => {
        const node: Node = {
          id: currentValue.categoryId,
          name: currentValue.name,
          children: [],
        };

        categoryMap[node.id] = node;

        const parentId = currentValue.ancestors[currentValue.ancestors.length - 1]?.categoryId;
        if (!parentId) {
          return [
            ...accumulator,
            node,
          ];
        }

        categoryMap[parentId].children.push(node);

        return accumulator;
      }, []);
    }));

    this.products = this.store.select(selectGroupedProducts).pipe(map((groups) => {
      return groups.reduce<Node[]>((accumulator, currentValue) => {

        return [
          ...accumulator,
          {
            id: undefined,
            name: currentValue.fullName,
            children: currentValue.products.map(p => ({
              id: p.productId,
              name: p.fullName,
              children: undefined,
            })),
          },
        ];
      }, []);
    }));

    this.store.dispatch(projectApiActions.listProjectsInitiated());
    this.store.dispatch(recipientApiActions.listRecipientsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(productApiActions.listProductsInitiated());

    this.form = new FormGroup({
      issuedAt: new FormControl([]),
      accounts: new FormControl(),
      recipients: new FormControl(),
      products: new FormControl(),
      projects: new FormControl(),
      categories: new FormControl(),
    }, [oneFilterRequiredValidator]);
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

      this.store.dispatch(transactionApiActions.listTransactionReportInitiated({
        request,
      }));
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
