import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export type LimitedCalendarDay = Responses.CalendarDay & {
  calculatedStart: number; 
  calculatedEnd: number;
};

export type CustomerJob = Responses.CustomerJob & {
  customer: Responses.Customer
};

export type CustomerJobReport = Api.Customer.CustomerId 
& Api.Customer.Job.Duration
& {
  customerName: Api.Customer.Name['name'];
  jobName: Api.Customer.Job.Name['name'];
  total: number;
  hourlyRate: number;
  prices: (Responses.Price & Api.Customer.Job.Quantity)[]
};

export type CustomerJobReportSort = keyof Pick<CustomerJobReport, 'duration' | 'total' | 'hourlyRate'>;

export type CalendarWeek = {
  start: number;
  end: number;
  days: {
    [date: string]: LimitedCalendarDay;
  };
};
