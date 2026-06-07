import { Calendar, Customer } from '@household/shared/types/types';

export const calculateTotalPrice = (workEntry: Calendar.Entry.WorkEntryResponse | Customer.Job.Response) => {
  return workEntry.prices.reduce((accumulator, currentValue) => {
    return accumulator + (currentValue.amount * currentValue.quantity);
  }, workEntry.additionalPrice ?? 0);
};
