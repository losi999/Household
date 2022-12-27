import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientMergeDialogComponent } from './recipient-merge-dialog.component';

describe('RecipientMergeDialogComponent', () => {
  let component: RecipientMergeDialogComponent;
  let fixture: ComponentFixture<RecipientMergeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipientMergeDialogComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipientMergeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
