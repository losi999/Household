import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HairdressingRoutingModule } from './hairdressing-routing.module';
import { HairdressingIncomeComponent } from './hairdressing-income/hairdressing-income.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DaysOfMonthPipe } from '@household/web/app/shared/days-of-month.pipe';
import { HairdressingIncomeListComponent } from './hairdressing-income-list/hairdressing-income-list.component';
import { HairdressingIncomeListItemComponent } from './hairdressing-income-list-item/hairdressing-income-list-item.component';

@NgModule({
  declarations: [
    HairdressingIncomeComponent,
    HairdressingIncomeListComponent,
    HairdressingIncomeListItemComponent,
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
    MatListModule,
    MatIconModule,
    MatButtonModule,
    DaysOfMonthPipe,
  ],
})
export class HairdressingModule { }
