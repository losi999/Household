import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Recipient } from '@household/shared/types/types';
import { RecipientService } from 'src/app/recipient/recipient.service';

export type RecipientFormData = Recipient.Response;

@Component({
  selector: 'household-recipient-form',
  templateUrl: './recipient-form.component.html',
  styleUrls: ['./recipient-form.component.scss'],
})
export class RecipientFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
  }>;
  constructor(private dialogRef: MatDialogRef<RecipientFormComponent, void>,
    private recipientService: RecipientService,
    @Inject(MAT_DIALOG_DATA) public recipient: RecipientFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.recipient?.name, [Validators.required]),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Recipient.Request = {
        name: this.form.value.name,
      };
      if (this.recipient) {
        this.recipientService.updateRecipient(this.recipient.recipientId, request);
      } else {
        this.recipientService.createRecipient(request);
      }

      this.dialogRef.close();
    }
  }
}
