import { httpErrors } from '@household/api/common/error-handlers';
import { getTransactionId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { CalendarEntryResolutionStatus, CalendarEntryType, SettingKey } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { ISettingService } from '@household/shared/services/setting-service';
import { Account, Calendar, Category, Transaction } from '@household/shared/types/types';

export interface IResolveCalendarWorkEntryService {
  (ctx: {
    body: Calendar.Entry.ResolutionRequest;
    expiresIn: number;
  } & Calendar.Entry.CalendarEntryId): Promise<Transaction.Id>;
}

export const resolveCalendarWorkEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService, 
  paymentTransactionDocumentConverter: IPaymentTransactionDocumentConverter, 
  settingService: ISettingService, 
  accountService: IAccountService, 
  categoryService: ICategoryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter): IResolveCalendarWorkEntryService => {
  return async ({ body, calendarEntryId, expiresIn }) => {
    const calendarEntry = await calendarEntryService.findCalendarEntryById(calendarEntryId).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.notFound({
      calendarEntry,
      calendarEntryId,
    });

    httpErrors.calendarEntry.wrongType({
      calendarEntry,
      expectedType: CalendarEntryType.Work,
    });
    
    httpErrors.calendarEntry.alreadyResolved(calendarEntry);

    if (body.status !== CalendarEntryResolutionStatus.Paid) {
      const update = calendarEntryDocumentConverter.resolve({
        body,
      }, expiresIn);

      await calendarEntryService.updateCalendarEntry(calendarEntryId, update).catch(httpErrors.calendarEntry.update({
        calendarEntryId,
        update,
      }));

      return;
    }

    const settings = await settingService.listSettingsByKeys(SettingKey.HairdressingIncomeAccount, SettingKey.HairdressingIncomeCategory,
    ).catch(httpErrors.setting.list([
      SettingKey.HairdressingIncomeAccount,
      SettingKey.HairdressingIncomeCategory,
    ]));

    const accountId = settings.find(s => s.settingKey === SettingKey.HairdressingIncomeAccount).value as Account.Id;
    const categoryId = settings.find(s => s.settingKey === SettingKey.HairdressingIncomeCategory).value as Category.Id;

    const [
      account,
      category,
    ] = await Promise.all([
      accountService.findAccountById(accountId).catch(httpErrors.account.getById({
        accountId,
      })),
      categoryService.findCategoryById(categoryId).catch(httpErrors.category.getById({
        categoryId,
      })),
    ]);

    const transaction = paymentTransactionDocumentConverter.createFromEntry({
      account, 
      calendarEntry,
      category, 
      amount: body.amount,
    }, expiresIn);

    const update = calendarEntryDocumentConverter.resolve({
      body,
      transaction,
    }, expiresIn);

    const saved = await calendarEntryService.updateCalendarEntryWithPayment(calendarEntryId, update).catch(httpErrors.calendarEntry.updateWithPayment({
      calendarEntryId, 
      transaction,
    }));

    return getTransactionId(saved);   
  };
};
