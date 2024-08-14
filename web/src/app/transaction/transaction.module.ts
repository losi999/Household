import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionEditComponent } from './transaction-edit/transaction-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { DatetimeInputComponent } from 'src/app/shared/datetime-input/datetime-input.component';
import { InventoryInputComponent } from 'src/app/shared/inventory-input/inventory-input.component';
import { InvoiceInputComponent } from 'src/app/shared/invoice-input/invoice-input.component';
import { AmountInputComponent } from 'src/app/shared/amount-input/amount-input.component';
import { ToolbarComponent } from 'src/app/shared/toolbar/toolbar.component';
import { AutocompleteModule } from 'src/app/shared/autocomplete/autocomplete.module';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';
import { TransactionListItemComponent } from './transaction-list-item/transaction-list-item.component';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    TransactionEditComponent,
    TransactionDetailsComponent,
    TransactionListItemComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatDialogModule,
    MatListModule,
    MatSliderModule,
    DatetimeInputComponent,
    InventoryInputComponent,
    InvoiceInputComponent,
    AmountInputComponent,
    ToolbarComponent,
    AutocompleteModule,
    ClearableInputComponent,
    MatExpansionModule,
  ],
  exports: [TransactionListItemComponent],
})
export class TransactionModule { }
