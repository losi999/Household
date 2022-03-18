import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Recipient } from '@household/shared/types/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { RecipientFormComponent, RecipientFormData, RecipientFormResult } from 'src/app/recipient/recipient-form/recipient-form.component';
import { RecipientService } from 'src/app/recipient/recipient.service';

@Component({
  selector: 'app-recipient-home',
  templateUrl: './recipient-home.component.html',
  styleUrls: ['./recipient-home.component.scss']
})
export class RecipientHomeComponent implements OnInit, OnDestroy {
  recipients: Recipient.Response[];
  refreshList: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private recipientService: RecipientService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.refreshList.unsubscribe();
  }

  ngOnInit(): void {
    this.recipients = this.activatedRoute.snapshot.data.recipients;

    this.refreshList = this.recipientService.refreshList.subscribe({
      next: () => {
        this.recipientService.listRecipients().subscribe((recipients) => {
          this.recipients = recipients;
        });
      }
    });
  }

  create() {
    const dialogRef = this.dialog.open<RecipientFormComponent, RecipientFormData, RecipientFormResult>(RecipientFormComponent);

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.recipientService.createRecipient(values);
        }
      }
    })
  }
}
