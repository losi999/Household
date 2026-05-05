import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAddToBlacklistDialog } from './customer-add-to-blacklist-dialog';

describe('CustomerAddToBlacklistDialog', () => {
  let component: CustomerAddToBlacklistDialog;
  let fixture: ComponentFixture<CustomerAddToBlacklistDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAddToBlacklistDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerAddToBlacklistDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
