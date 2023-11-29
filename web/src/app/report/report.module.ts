import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from 'src/app/report/report-routing.module';
import { ReportHomeComponent } from 'src/app/report/report-home/report-home.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectAllListComponent } from 'src/app/shared/select-all-list/select-all-list.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ReportHomeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportRoutingModule,
    MatExpansionModule,
    MatButtonModule,
    SharedModule,
    SelectAllListComponent,
  ],
})
export class ReportModule { }
