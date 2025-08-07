import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailsJobItemComponent } from './customer-details-job-item.component';

describe('CustomerDetailsJobItemComponent', () => {
  let component: CustomerDetailsJobItemComponent;
  let fixture: ComponentFixture<CustomerDetailsJobItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerDetailsJobItemComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsJobItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
