import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Account, Category, Setting } from '@household/shared/types/types';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { settingApiActions } from '@household/web/state/setting/setting.actions';
import { selectHairdressingIncomeAccount, selectHairdressingIncomeCategory } from '@household/web/state/setting/setting.selector';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-settings-hairdressing',
  standalone: false,
  templateUrl: './settings-hairdressing.component.html',
  styleUrl: './settings-hairdressing.component.scss',
})
export class SettingsHairdressingComponent implements OnInit {
  hairdressingIncomeAccount: FormControl<Account.Response>;
  hairdressingIncomeCategory: FormControl<Category.Response>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.hairdressingIncomeAccount = new FormControl();
    this.hairdressingIncomeCategory = new FormControl();

    this.store.select(selectHairdressingIncomeAccount).pipe(
      takeFirstDefined(),
    )
      .subscribe((account) => {
        this.hairdressingIncomeAccount.patchValue(account, {
          emitEvent: false,
        });
      });

    this.store.select(selectHairdressingIncomeCategory).pipe(
      takeFirstDefined(),
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
