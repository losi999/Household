import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJobsHome } from './customer-jobs-home';

describe.skip('CustomerJobsHome', () => {
  let component: CustomerJobsHome;
  let fixture: ComponentFixture<CustomerJobsHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerJobsHome],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerJobsHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
