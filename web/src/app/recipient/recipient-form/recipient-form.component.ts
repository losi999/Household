import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipient } from '@household/shared/types/types';

export type RecipientFormData = Recipient.Response;
export type RecipientFormResult = Recipient.Request;

@Component({
  selector: 'app-recipient-form',
  templateUrl: './recipient-form.component.html',
  styleUrls: ['./recipient-form.component.scss']
})
export class RecipientFormComponent implements OnInit {
  form: FormGroup;
  constructor(private dialogRef: MatDialogRef<RecipientFormComponent, RecipientFormResult>,
    @Inject(MAT_DIALOG_DATA) public recipient: RecipientFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.recipient?.name, [Validators.required])
    })
  }

  save() {
    if(this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
      });
    }
  }
}
