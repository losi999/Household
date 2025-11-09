import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAddToBlacklistDialogComponent } from './customer-add-to-blacklist-dialog.component';

xdescribe('CustomerAddToBlacklistDialogComponent', () => {
  let component: CustomerAddToBlacklistDialogComponent;
  let fixture: ComponentFixture<CustomerAddToBlacklistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerAddToBlacklistDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerAddToBlacklistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
