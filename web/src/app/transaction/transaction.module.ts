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
import { DatetimeInputComponent } from '@household/web/app/shared/datetime-input/datetime-input.component';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { TransactionListItemComponent } from './transaction-list-item/transaction-list-item.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { TransactionPaymentEditComponent } from './transaction-payment-edit/transaction-payment-edit.component';
import { TransactionSplitEditComponent } from './transaction-split-edit/transaction-split-edit.component';
import { TransactionTransferEditComponent } from './transaction-transfer-edit/transaction-transfer-edit.component';
import { TransactionLoanEditComponent } from './transaction-loan-edit/transaction-loan-edit.component';
import { AccountAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/account-autocomplete-input/account-autocomplete-input.component';
import { ProjectAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/project-autocomplete-input/project-autocomplete-input.component';
import { RecipientAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/recipient-autocomplete-input/recipient-autocomplete-input.component';
import { CategoryAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/category-autocomplete-input/category-autocomplete-input.component';
import { ProductAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/product-autocomplete-input/product-autocomplete-input.component';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TransactionShortDetailsComponent } from './transaction-short-details/transaction-short-details.component';
import { LetDirective } from '@ngrx/component';
import { DeferredTransactionFilterPipe } from './deferred-transaction-filter.pipe';
import { OrderByPipe } from '@household/web/app/shared/order-by.pipe';

@NgModule({
  declarations: [
    TransactionEditComponent,
    TransactionDetailsComponent,
    TransactionListItemComponent,
    TransactionPaymentEditComponent,
    TransactionSplitEditComponent,
    TransactionTransferEditComponent,
    TransactionLoanEditComponent,
    TransactionShortDetailsComponent,
    DeferredTransactionFilterPipe,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatListModule,
    MatSliderModule,
    DatetimeInputComponent,
    AmountInputComponent,
    ToolbarComponent,
    AccountAutocompleteInputComponent,
    ProjectAutocompleteInputComponent,
    RecipientAutocompleteInputComponent,
    CategoryAutocompleteInputComponent,
    ProductAutocompleteInputComponent,
    MatInputModule,
    MatDatepickerModule,
    ClearableInputComponent,
    MatExpansionModule,
    LetDirective,
    OrderByPipe,
  ],
  exports: [
    TransactionListItemComponent,
    TransactionShortDetailsComponent,
  ],
})
export class TransactionModule { }
