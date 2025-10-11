import { SettingKey } from '@household/shared/enums';
import { Account, Category, Setting } from '@household/shared/types/types';
import { selectAccounts } from '@household/web/state/account/account.selector';
import { selectCategories } from '@household/web/state/category/category.selector';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectSettings = createFeatureSelector<Setting.Response[]>('settings');

const selectSettingByKey = (settingKey: SettingKey) => createSelector(selectSettings, (settings) => {
  return settings?.find(a => a.settingKey === settingKey);
});

export const selectHairdressingIncomeAccountId = createSelector(selectSettingByKey(SettingKey.HairdressingIncomeAccount), (setting) => {
  return setting?.value as Account.Id;
});

export const selectHairdressingIncomeCategoryId = createSelector(selectSettingByKey(SettingKey.HairdressingIncomeCategory), (setting) => {
  return setting?.value as Category.Id;
});

export const selectHairdressingIncomeAccount = createSelector(selectSettingByKey(SettingKey.HairdressingIncomeAccount), selectAccounts, (setting, accounts) => {
  return accounts?.find(c => c.accountId === setting?.value);
});

export const selectHairdressingIncomeCategory = createSelector(selectSettingByKey(SettingKey.HairdressingIncomeCategory), selectCategories, (setting, categories) => {
  return categories?.find(c => c.categoryId === setting?.value);
});
