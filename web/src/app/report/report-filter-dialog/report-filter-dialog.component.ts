import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ReportFilterDialogData = {
  items: any[];
  title: string;
  displayPropertyName: string;
  keyPropertyName: string;
  parentPropertyName: string;
};
export type ReportFilterDialogResult = any[];

@Component({
  selector: 'household-report-filter-dialog',
  templateUrl: './report-filter-dialog.component.html',
  styleUrl: './report-filter-dialog.component.scss',
})
export class ReportFilterDialogComponent implements OnInit {
  selected: FormControl<any[]>;
  constructor(
    private dialogRef: MatDialogRef<ReportFilterDialogComponent, ReportFilterDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ReportFilterDialogData,
  ) { }

  ngOnInit(): void {
    this.selected = new FormControl();
  }

  filter() {
    this.dialogRef.close(this.selected.value);
  }
}
