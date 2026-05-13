import { Calendar, Customer } from '@household/shared/types/types';

export type LimitedCalendarDay = Calendar.Day.Response & {
  calculatedStart: number; 
  calculatedEnd: number;
};

export type CustomerJob = Customer.Job.Response & {
  customer: Customer.Response
};

export type CalendarWeek = {
  start: number;
  end: number;
  days: {
    [date: string]: LimitedCalendarDay;
  };
};
