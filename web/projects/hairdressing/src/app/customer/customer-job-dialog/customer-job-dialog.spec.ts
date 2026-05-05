import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJobDialog } from './customer-job-dialog';

describe('CustomerJobDialog', () => {
  let component: CustomerJobDialog;
  let fixture: ComponentFixture<CustomerJobDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerJobDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerJobDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
