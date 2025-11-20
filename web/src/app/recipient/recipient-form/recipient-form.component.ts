import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Recipient } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { recipientApiActions } from '@household/web/state/recipient/recipient.actions';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { MatButtonModule } from '@angular/material/button';

export type RecipientFormData = Recipient.Response;

@Component({
  selector: 'household-recipient-form',
  templateUrl: './recipient-form.component.html',
  styleUrls: ['./recipient-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    ClearableInputComponent,
    MatButtonModule,
  ],
})
export class RecipientFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
  }>;
  constructor(private dialogRef: MatDialogRef<RecipientFormComponent, void>,
    private store: Store,
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
        this.store.dispatch(recipientApiActions.updateRecipientInitiated({
          recipientId: this.recipient.recipientId,
          ...request,
        }));
      } else {
        this.store.dispatch(recipientApiActions.createRecipientInitiated(request));
      }

      this.dialogRef.close();
    }
  }
}
