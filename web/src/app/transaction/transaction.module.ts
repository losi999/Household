import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionEditComponent } from './transaction-edit/transaction-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    TransactionEditComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatDialogModule,
  ],
  exports: []
})
export class TransactionModule { }
