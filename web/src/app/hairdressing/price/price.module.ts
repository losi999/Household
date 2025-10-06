import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceRoutingModule } from '@household/web/app/hairdressing/price/price-routing.module';
import { PriceDialogComponent } from '@household/web/app/hairdressing/price/price-dialog/price-dialog.component';
import { PriceListItemComponent } from '@household/web/app/hairdressing/price/price-list-item/price-list-item.component';
import { PriceListComponent } from '@household/web/app/hairdressing/price/price-list/price-list.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { AmountInputComponent } from '@household/web/app/shared/amount-input/amount-input.component';
import { MatSelectModule } from '@angular/material/select';
import { PriceEffects } from '@household/web/app/hairdressing/price/state/price.effects';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [
    PriceListComponent,
    PriceListItemComponent,
    PriceDialogComponent,
  ],
  imports: [
    CommonModule,
    PriceRoutingModule,
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ClearableInputComponent,
    AmountInputComponent,
    MatSelectModule,
    EffectsModule.forFeature([PriceEffects]),
  ],
})
export class PriceModule { }
