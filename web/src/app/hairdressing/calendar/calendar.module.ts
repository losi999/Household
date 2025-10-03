import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from '@household/web/app/hairdressing/calendar/calendar-routing.module';
import { CalendarHomeComponent } from './calendar-home/calendar-home.component';
import { CalendarVerticalDayComponent } from './calendar-vertical-day/calendar-vertical-day.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CalendarTimeColumnPipe } from '@household/web/app/hairdressing/calendar/calendar-time-column.pipe';
import { CalendarGridRowsPipe } from '@household/web/app/hairdressing/calendar/calendar-grid-rows.pipe';
import { TimeRangeSliderComponent } from '@household/web/app/hairdressing/calendar/time-range-slider/time-range-slider.component';
import { MatSliderModule } from '@angular/material/slider';
import { TimeSlotToTimePipe } from '@household/web/app/shared/time-slot-to-time.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarWorkdayDialogComponent } from './calendar-workday-dialog/calendar-workday-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { CalendarEntryDetailsDialogComponent } from '@household/web/app/hairdressing/calendar/calendar-entry-details-dialog/calendar-entry-details-dialog.component';
import { CalendarHorizontalDayComponent } from '@household/web/app/hairdressing/calendar/calendar-horizontal-day/calendar-horizontal-day.component';
import { CalendarEntryEditDialogComponent } from '@household/web/app/hairdressing/calendar/calendar-entry-edit-dialog/calendar-entry-edit-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { JobPriceCalculatorComponent } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';
import { JobPriceSummaryComponent } from '@household/web/app/shared/job-price-summary/job-price-summary.component';
import { CalendarEntryPayingComponent } from '@household/web/app/hairdressing/calendar/calendar-entry-paying/calendar-entry-paying.component';
import { CustomerJobAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-job-autocomplete-input/customer-job-autocomplete-input.component';
import { DurationStepperComponent } from '@household/web/app/shared/duration-stepper/duration-stepper.component';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { CalendarCashPaymentDialogComponent } from '@household/web/app/hairdressing/calendar/calendar-cash-payment-dialog/calendar-cash-payment-dialog.component';

@NgModule({
  declarations: [
    CalendarHomeComponent,
    CalendarVerticalDayComponent,
    CalendarTimeColumnPipe,
    CalendarGridRowsPipe,
    TimeRangeSliderComponent,
    CalendarWorkdayDialogComponent,
    CalendarEntryDetailsDialogComponent,
    CalendarHorizontalDayComponent,
    CalendarEntryEditDialogComponent,
    CalendarEntryPayingComponent,
    CalendarCashPaymentDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarRoutingModule,
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSliderModule,
    TimeSlotToTimePipe,
    MatDialogModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatDividerModule,
    IconTextComponent,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    CustomerJobAutocompleteInputComponent,
    ClearableInputComponent,
    JobPriceCalculatorComponent,
    JobPriceSummaryComponent,
    DurationStepperComponent,
    AmountInputComponent,
  ],
})
export class CalendarModule { }
