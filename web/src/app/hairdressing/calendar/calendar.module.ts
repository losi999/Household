import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from '@household/web/app/hairdressing/calendar/calendar-routing.module';
import { CalendarHomeComponent } from './calendar-home/calendar-home.component';
import { CalendarVerticalDayComponent } from './calendar-vertical-day/calendar-vertical-day.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CalendarTimeColumnPipe } from '@household/web/app/hairdressing/calendar/pipes/calendar-time-column.pipe';
import { CalendarGridRowsPipe } from '@household/web/app/hairdressing/calendar/pipes/calendar-grid-rows.pipe';
import { MatSliderModule } from '@angular/material/slider';
import { TimeSlotToTimePipe } from '@household/web/app/shared/pipes/time-slot-to-time.pipe';
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
import { DurationStepperComponent } from '@household/web/app/shared/duration-stepper/duration-stepper.component';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { CalendarCashPaymentDialogComponent } from '@household/web/app/hairdressing/calendar/calendar-cash-payment-dialog/calendar-cash-payment-dialog.component';
import { CalendarEntryPayingDialogComponent } from './calendar-entry-paying-dialog/calendar-entry-paying-dialog.component';
import { EffectsModule } from '@ngrx/effects';
import { CalendarEffects } from '@household/web/app/hairdressing/calendar/state/calendar.effects';
import { CustomerAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-autocomplete-input/customer-autocomplete-input.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    CalendarHomeComponent,
    CalendarVerticalDayComponent,
    CalendarTimeColumnPipe,
    CalendarGridRowsPipe,
    CalendarWorkdayDialogComponent,
    CalendarEntryDetailsDialogComponent,
    CalendarHorizontalDayComponent,
    CalendarEntryEditDialogComponent,
    CalendarCashPaymentDialogComponent,
    CalendarEntryPayingDialogComponent,
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
    CustomerAutocompleteInputComponent,
    MatSelectModule,
    ClearableInputComponent,
    JobPriceCalculatorComponent,
    JobPriceSummaryComponent,
    DurationStepperComponent,
    AmountInputComponent,
    EffectsModule.forFeature([CalendarEffects]),
  ],
})
export class CalendarModule { }
