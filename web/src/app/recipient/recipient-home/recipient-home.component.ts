import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Recipient } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';
import { RecipientService } from 'src/app/recipient/recipient.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'app-recipient-home',
  templateUrl: './recipient-home.component.html',
  styleUrls: ['./recipient-home.component.scss'],
})
export class RecipientHomeComponent implements OnInit, OnDestroy {
  recipients: Recipient.Response[];
  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private recipientService: RecipientService, private dialogService: DialogService) { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.recipients = this.activatedRoute.snapshot.data.recipients;

    this.recipientService.collectionUpdated.pipe(takeUntil(this.destroyed)).subscribe((event) => {
      switch (event.action) {
        case 'deleted': {
          this.recipients = this.recipients.filter(p => p.recipientId !== event.recipientId);
        } break;
      }

      this.recipientService.listRecipients().subscribe({
        next: (recipients) => {
          this.recipients = recipients;
        },
      });
    });
  }

  create() {
    this.dialogService.openCreateRecipientDialog();
  }
}
