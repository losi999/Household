import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerRoutingModule } from '@household/web/app/hairdressing/customer/customer-routing.module';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerListItemComponent } from './customer-list-item/customer-list-item.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { MatCardModule } from '@angular/material/card';
import { CustomerDetailsJobItemComponent } from './customer-details-job-item/customer-details-job-item.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MinutesToHourPipe } from '@household/web/app/shared/minutes-to-hour.pipe';
import { CustomerJobDialogComponent } from './customer-job-dialog/customer-job-dialog.component';
import { TimeSlotToTimePipe } from '@household/web/app/shared/time-slot-to-time.pipe';
import { JobPriceSummaryComponent } from '@household/web/app/shared/job-price-summary/job-price-summary.component';
import { JobPriceCalculatorComponent } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomerAddToBlacklistDialogComponent } from './customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog.component';
import { CustomerAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-autocomplete-input/customer-autocomplete-input.component';

@NgModule({
  declarations: [
    CustomerDetailsComponent,
    CustomerHomeComponent,
    CustomerListComponent,
    CustomerListItemComponent,
    CustomerDialogComponent,
    CustomerDetailsJobItemComponent,
    CustomerJobDialogComponent,
    CustomerAddToBlacklistDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomerRoutingModule,
    MatListModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    ClearableInputComponent,
    AutocompleteFilterPipe,
    ToolbarComponent,
    IconTextComponent,
    MatCardModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MinutesToHourPipe,
    TimeSlotToTimePipe,
    JobPriceSummaryComponent,
    JobPriceCalculatorComponent,
    MatCheckboxModule,
    CustomerAutocompleteInputComponent,
  ],
})
export class CustomerModule { }
