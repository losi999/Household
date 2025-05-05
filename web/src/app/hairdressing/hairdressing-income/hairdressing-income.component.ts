import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDateFormats, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import 'moment/locale/hu';
import { map, mergeMap, Observable, startWith, tap } from 'rxjs';
import moment, { Moment } from 'moment';
import { Store } from '@ngrx/store';
import { settingApiActions } from '@household/web/state/setting/setting.actions';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Account, Transaction } from '@household/shared/types/types';
import { accountApiActions } from '@household/web/state/account/account.actions';
import { selectIncomeByMonth } from '@household/web/state/hairdressing/hairdressing.selector';
import { selectSettingByKey } from '@household/web/state/setting/setting.selector';
import { takeFirstDefined } from '@household/web/operators/take-first-defined';
import { selectAccountById } from '@household/web/state/account/account.selector';

const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'YYYY.MM.DD',
  },
  display: {
    dateInput: 'YYYY MMMM',
    monthYearLabel: 'YYYY MMMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM',
  },
};

@Component({
  selector: 'household-hairdressing-income',
  standalone: false,
  templateUrl: './hairdressing-income.component.html',
  styleUrl: './hairdressing-income.component.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: CUSTOM_DATE_FORMATS,
    },
  ],
})
export class HairdressingIncomeComponent implements OnInit {
  date: FormControl<Moment>;
  account: Observable<Account.Response>;

  transactions: Observable<Transaction.Report[]>;

  constructor(private store: Store) {

  }

  ngOnInit(): void {
    this.store.dispatch(settingApiActions.listSettingsInitiated());
    this.store.dispatch(accountApiActions.listAccountsInitiated());

    this.account = this.store.select(selectSettingByKey('hairdressingIncomeAccount')).pipe(takeFirstDefined(),
      mergeMap((setting) => {
        return this.store.select(selectAccountById(setting.value as Account.Id));
      }));

    this.date = new FormControl({
      value: moment(),
      disabled: true,
    });

    this.date.valueChanges.pipe(startWith(this.date.value),
      tap((newDate) => {
        this.transactions = this.store.select(selectIncomeByMonth(newDate.format('YYYY-MM')));
      }),
      map((newDate) => hairdressingActions.listIncomeInitiated({
        date: newDate.toDate(),
      })))
      .subscribe((action) => {
        this.store.dispatch(action);
      })
    ;
  }
  setMonthAndYear(newDate: Moment, datepicker: MatDatepicker<Date>) {
    this.date.setValue(newDate);
    datepicker.close();
  }

  nextMonth() {
    const newDate = moment(this.date.value);
    newDate.month(newDate.month() + 1);
    this.date.setValue(newDate);
  }

  previousMonth() {
    const newDate = moment(this.date.value);
    newDate.month(newDate.month() - 1);
    this.date.setValue(newDate);
  }

}
