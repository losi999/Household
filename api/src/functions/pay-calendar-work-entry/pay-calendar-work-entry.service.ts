import { httpErrors } from '@household/api/common/error-handlers';
import { getTransactionId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { IPaymentTransactionDocumentConverter } from '@household/shared/converters/payment-transaction-document-converter';
import { CalendarEntryType, PaymentType, SettingKey } from '@household/shared/enums';
import { IAccountService } from '@household/shared/services/account-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICategoryService } from '@household/shared/services/category-service';
import { ISettingService } from '@household/shared/services/setting-service';
import { Account, Calendar, Category, Transaction } from '@household/shared/types/types';

export interface IPayCalendarWorkEntryService {
  (ctx: {
    body: Calendar.Entry.PaymentRequest;
  } & Calendar.Entry.CalendarEntryId): Promise<Transaction.Id>;
}

export const payCalendarWorkEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService, 
  paymentTransactionDocumentConverter: IPaymentTransactionDocumentConverter, 
  settingService: ISettingService, 
  accountService: IAccountService, 
  categoryService: ICategoryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter): IPayCalendarWorkEntryService => {
  return async ({ body, calendarEntryId }) => {
    const calendarEntry = await calendarEntryService.findCalendarEntryById(calendarEntryId).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.wrongType({
      calendarEntry,
      expectedType: CalendarEntryType.Work,
    });
    
    httpErrors.calendarEntry.alreadyPaid(calendarEntry);

    if (body.paymentType === PaymentType.Transfer) {
      const update = calendarEntryDocumentConverter.updatePaid();

      await calendarEntryService.updateCalendarEntry(calendarEntryId, update).catch(httpErrors.calendarEntry.update({
        calendarEntryId,
        update,
      }));

      return;
    }

    const settings = await settingService.listSettingsByKeys([
      SettingKey.HairdressingIncomeAccount,
      SettingKey.HairdressingIncomeCategory,
    ]).catch(httpErrors.setting.list([
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
    });

    const saved = await calendarEntryService.updateCalendarEntryWithPayment(calendarEntryId, transaction).catch(httpErrors.calendarEntry.updateWithPayment({
      calendarEntryId, 
      transaction,
    }));

    return getTransactionId(saved);    
  };
};
