import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerRoutingModule } from '@household/web/app/customer/customer-routing.module';
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
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { MatCardModule } from '@angular/material/card';
import { CustomerDetailsJobItemComponent } from './customer-details-job-item/customer-details-job-item.component';
import { MatMenuModule } from '@angular/material/menu';
import { CustomerJobFormComponent } from './customer-job-form/customer-job-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MinutesToHourPipe } from '@household/web/app/shared/minutes-to-hour.pipe';

@NgModule({
  declarations: [
    CustomerDetailsComponent,
    CustomerHomeComponent,
    CustomerListComponent,
    CustomerListItemComponent,
    CustomerFormComponent,
    CustomerDetailsJobItemComponent,
    CustomerJobFormComponent,
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
  ],
})
export class CustomerModule { }
