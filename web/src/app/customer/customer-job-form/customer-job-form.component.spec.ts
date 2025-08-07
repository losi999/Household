import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJobFormComponent } from './customer-job-form.component';

describe('CustomerJobFormComponent', () => {
  let component: CustomerJobFormComponent;
  let fixture: ComponentFixture<CustomerJobFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerJobFormComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerJobFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
