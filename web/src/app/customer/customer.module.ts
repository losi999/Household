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

@NgModule({
  declarations: [
    CustomerDetailsComponent,
    CustomerHomeComponent,
    CustomerListComponent,
    CustomerListItemComponent,
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    ClearableInputComponent,
    AutocompleteFilterPipe,
    ToolbarComponent,
  ],
})
export class CustomerModule { }
