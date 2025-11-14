import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterModule } from '@angular/router';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Customer } from '@household/shared/types/types';
import { CustomerListItemComponent } from '@household/web/app/hairdressing/customer/customer-list-item/customer-list-item.component';

describe('CustomerListItemComponent', () => {
  let component: CustomerListItemComponent;
  let fixture: ComponentFixture<CustomerListItemComponent>;
  let customer: Customer.Response;

  beforeEach(async () => {
    customer = testDataFactory.customer.response();

    await TestBed.configureTestingModule({
      declarations: [CustomerListItemComponent],
      imports: [
        MatListModule,
        RouterModule,
      ],
      providers: [provideRouter([])],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerListItemComponent);
    component = fixture.componentInstance;
    component.customer = customer;
    fixture.detectChanges();
  });

  it('should contain a link to customer details page', () => {
    expect(fixture.debugElement.query(By.css('a')).attributes.href).toContain(customer.customerId);
  });

  it('should display customer name', () => {
    expect(fixture.debugElement.query(By.css('a')).nativeElement.textContent).toEqual(customer.name);
  });
});
