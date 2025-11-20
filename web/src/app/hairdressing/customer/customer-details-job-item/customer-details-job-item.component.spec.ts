import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailsJobItemComponent } from '@household/web/app/hairdressing/customer/customer-details-job-item/customer-details-job-item.component';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { ActivatedRoute, convertToParamMap, RouterLink } from '@angular/router';
import { MatCardTitle } from '@angular/material/card';
import { JobPriceSummaryComponent } from '@household/web/app/shared/job-price-summary/job-price-summary.component';
import { customerActions } from '@household/web/app/hairdressing/customer/state/customer.actions';

describe('CustomerDetailsJobItemComponent', () => {
  let component: CustomerDetailsJobItemComponent;
  let fixture: ComponentFixture<CustomerDetailsJobItemComponent>;
  let selector: IElementSelector;
  let mockStore: MockStore;
  let customerId: Customer.Id;
  let job: Customer.Job.Response;

  beforeEach(async () => {
    customerId = testDataFactory.customer.id();
    job = testDataFactory.customer.job.response();

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsJobItemComponent],
      providers: [
        provideMockStore({}),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                customerId, 
              }),
            },
          },
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsJobItemComponent);
    mockStore = TestBed.inject(MockStore);
    
    spyOn(mockStore, 'dispatch').and.callThrough();
    component = fixture.componentInstance;

    component.job = job;

    selector = elementSelectorFactory(fixture.debugElement);
    fixture.detectChanges();
  });

  describe('job name', () => {
    it('should be rendered', () => {
      const element = selector.getComponent(MatCardTitle);
      expect(element.nativeElement.textContent).toEqual(job.name);
    });
  });

  describe('job prices', () => {
    it('should be rendered', () => {
      const element = selector.getComponent(JobPriceSummaryComponent);
      expect(element.componentInstance.prices).toEqual(job.prices);
    });
  });

  describe('search time slot button', () => {
    it('should be rendered', () => {
      const button = selector.getElementByTestId('search-button');
      const link = button.injector.get(RouterLink);

      expect(link.queryParams.customerId).toEqual(customerId);
      expect(link.queryParams.jobName).toEqual(job.name);
    });
  });

  describe('menu button', () => {
    it('should be rendered', () => {
      expect(selector.getElementByTestId('menu-button')).toBeTruthy();
    });
  });

  describe('edit job button', () => {
    it('should NOT be rendered initially', () => {
      expect(selector.getElementByTestId('edit-job-button')).toBeFalsy();
    });

    it('should be rendered after menu button click', () => {
      selector.getElementByTestId<HTMLButtonElement>('menu-button').nativeElement.click();

      fixture.detectChanges();

      expect(selector.getElementByTestId('edit-job-button')).toBeTruthy();
    });

    it('should dispatch [Customer] Update customer job on click', () => {
      selector.getElementByTestId<HTMLButtonElement>('menu-button').nativeElement.click();

      fixture.detectChanges();

      selector.getElementByTestId('edit-job-button').nativeElement.click();

      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.updateCustomerJob({
        customerId,
        ...job,
      }));
    });
  });

  describe('delete job button', () => {
    it('should NOT be rendered initially', () => {
      expect(selector.getElementByTestId('delete-job-button')).toBeFalsy();
    });

    it('should be rendered after menu button click', () => {
      selector.getElementByTestId<HTMLButtonElement>('menu-button').nativeElement.click();

      fixture.detectChanges();

      expect(selector.getElementByTestId('delete-job-button')).toBeTruthy();
    });

    it('should dispatch [Customer] Update customer job on click', () => {
      selector.getElementByTestId<HTMLButtonElement>('menu-button').nativeElement.click();

      fixture.detectChanges();

      selector.getElementByTestId('delete-job-button').nativeElement.click();

      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.deleteCustomerJob({
        customerId,
        name: job.name,
      }));
    });
  });
});
