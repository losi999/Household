import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Account, Category, Setting } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectAccountById } from '@household/web/state/account/account.selector';
import { categoryApiActions } from '@household/web/state/category/category.actions';
import { selectCategoryById } from '@household/web/state/category/category.selector';
import { settingApiActions } from '@household/web/state/setting/setting.actions';
import { selectSettingByKey } from '@household/web/state/setting/setting.selector';
import { Store } from '@ngrx/store';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'household-settings-home',
  standalone: false,
  templateUrl: './settings-home.component.html',
  styleUrl: './settings-home.component.scss',
})
export class SettingsHomeComponent implements OnInit {
  hairdressingIncomeAccount: FormControl<Account.Response>;
  hairdressingIncomeCategory: FormControl<Category.Response>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(accountApiActions.listAccountsInitiated());
    this.store.dispatch(categoryApiActions.listCategoriesInitiated());
    this.store.dispatch(settingApiActions.listSettingsInitiated());

    this.hairdressingIncomeAccount = new FormControl();
    this.hairdressingIncomeCategory = new FormControl();

    this.store.select(selectSettingByKey('hairdressingIncomeAccount')).pipe(
      takeFirstDefined(),
      mergeMap((setting) => this.store.select(selectAccountById(setting.value as Account.Id))),
    )
      .subscribe((account) => {
        this.hairdressingIncomeAccount.patchValue(account, {
          emitEvent: false,
        });
      });

    this.store.select(selectSettingByKey('hairdressingIncomeCategory')).pipe(
      takeFirstDefined(),
      mergeMap((setting) => this.store.select(selectCategoryById(setting.value as Category.Id))),
    )
      .subscribe((category) => {
        this.hairdressingIncomeCategory.patchValue(category, {
          emitEvent: false,
        });
      });

    this.hairdressingIncomeAccount.valueChanges.subscribe((value) => {
      if (value) {
        this.store.dispatch(settingApiActions.updateSettingInitiated({
          settingKey: 'hairdressingIncomeAccount' as Setting.Id,
          value: value.accountId,
        }));
      }
    });

    this.hairdressingIncomeCategory.valueChanges.subscribe((value) => {
      if (value) {
        this.store.dispatch(settingApiActions.updateSettingInitiated({
          settingKey: 'hairdressingIncomeCategory' as Setting.Id,
          value: value.categoryId,
        }));
      }
    });
  }
}
