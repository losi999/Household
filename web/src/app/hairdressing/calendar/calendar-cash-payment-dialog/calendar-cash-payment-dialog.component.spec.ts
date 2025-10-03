import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarCashPaymentDialogComponent } from './calendar-cash-payment-dialog.component';

describe('CalendarCashPaymentDialogComponent', () => {
  let component: CalendarCashPaymentDialogComponent;
  let fixture: ComponentFixture<CalendarCashPaymentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarCashPaymentDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CalendarCashPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
