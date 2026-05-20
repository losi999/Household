import { Calendar, Customer, Price } from '@household/shared/types/types';

export type LimitedCalendarDay = Calendar.Day.Response & {
  calculatedStart: number; 
  calculatedEnd: number;
};

export type CustomerJob = Customer.Job.Response & {
  customer: Customer.Response
};

export type CustomerJobReport = Customer.CustomerId 
& Customer.Job.Duration
& {
  customerName: Customer.Name['name'];
  jobName: Customer.Job.Name['name'];
  total: number;
  hourlyRate: number;
  prices: Price.Response[]
};

export type CustomerJobReportSort = keyof Pick<CustomerJobReport, 'duration' | 'total' | 'hourlyRate'>;

export type CalendarWeek = {
  start: number;
  end: number;
  days: {
    [date: string]: LimitedCalendarDay;
  };
};
