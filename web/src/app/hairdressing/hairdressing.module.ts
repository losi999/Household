import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HairdressingRoutingModule } from './hairdressing-routing.module';
import { HairdressingIncomeHomeComponent } from './hairdressing-income-home/hairdressing-income-home.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DaysOfMonthPipe } from '@household/web/app/shared/days-of-month.pipe';
import { HairdressingIncomeListComponent } from './hairdressing-income-list/hairdressing-income-list.component';
import { HairdressingIncomeListItemComponent } from './hairdressing-income-list-item/hairdressing-income-list-item.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { MatChipsModule } from '@angular/material/chips';
import { SplitPipe } from '@household/web/app/shared/split.pipe';
import { MatListModule } from '@angular/material/list';
import { HairdressingPriceListComponent } from './hairdressing-price-list/hairdressing-price-list.component';
import { HairdressingPriceListItemComponent } from './hairdressing-price-list-item/hairdressing-price-list-item.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { HairdressingPriceFormComponent } from './hairdressing-price-form/hairdressing-price-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { HairdressingPriceSubmenuComponent } from './hairdressing-price-submenu/hairdressing-price-submenu.component';
import { HairdressingCalendarHomeComponent } from './hairdressing-calendar-home/hairdressing-calendar-home.component';
import { HairdressingCalendarDayComponent } from './hairdressing-calendar-day/hairdressing-calendar-day.component';
import { HairdressingCalendarEntryEditDialogComponent } from './hairdressing-calendar-entry-edit-dialog/hairdressing-calendar-entry-edit-dialog.component';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatMenuModule } from '@angular/material/menu';
import { HairdressingCalendarWorkdayDialogComponent } from './hairdressing-calendar-workday-dialog/hairdressing-calendar-workday-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CalendarGridRowsPipe } from './calendar-grid-rows.pipe';
import { CalendarTimeColumnPipe } from './calendar-time-column.pipe';
import { TimeRangeSliderComponent } from '@household/web/app/hairdressing/time-range-slider/time-range-slider.component';
import { MatSelectModule } from '@angular/material/select';
import { CustomerJobAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-job-autocomplete-input/customer-job-autocomplete-input.component';
import { TimeSlotToTimePipe } from '@household/web/app/shared/time-slot-to-time.pipe';
import { HairdressingCalendarEntryDetailsDialogComponent } from '@household/web/app/hairdressing/hairdressing-calendar-entry-details-dialog/hairdressing-calendar-entry-details-dialog.component';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { MinutesToHourPipe } from '@household/web/app/shared/minutes-to-hour.pipe';
import { JobPriceSummaryComponent } from '@household/web/app/shared/job-price-summary/job-price-summary.component';
import { HairdressingCalendarHorizontalDayComponent } from './hairdressing-calendar-horizontal-day/hairdressing-calendar-horizontal-day.component';

@NgModule({
  declarations: [
    HairdressingIncomeHomeComponent,
    HairdressingIncomeListComponent,
    HairdressingIncomeListItemComponent,
    HairdressingPriceListComponent,
    HairdressingPriceListItemComponent,
    HairdressingPriceFormComponent,
    HairdressingPriceSubmenuComponent,
    HairdressingCalendarHomeComponent,
    HairdressingCalendarDayComponent,
    HairdressingCalendarEntryEditDialogComponent,
    HairdressingCalendarEntryDetailsDialogComponent,
    HairdressingCalendarWorkdayDialogComponent,
    CalendarGridRowsPipe,
    CalendarTimeColumnPipe,
    TimeRangeSliderComponent,
    HairdressingCalendarHorizontalDayComponent,
  ],
  imports: [
    CommonModule,
    HairdressingRoutingModule,
    ToolbarComponent,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    DaysOfMonthPipe,
    SplitPipe,
    MatExpansionModule,
    AmountInputComponent,
    MatChipsModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    ClearableInputComponent,
    AmountInputComponent,
    MatTimepickerModule,
    MatMenuModule,
    MatRadioModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatSelectModule,
    CustomerJobAutocompleteInputComponent,
    TimeSlotToTimePipe,
    IconTextComponent,
    MinutesToHourPipe,
    JobPriceSummaryComponent,
  ],
})
export class HairdressingModule { }
