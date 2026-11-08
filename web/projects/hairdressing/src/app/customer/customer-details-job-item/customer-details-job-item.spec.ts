import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailsJobItem } from './customer-details-job-item';
import { createStubComponent, elementSelectorFactory, IElementSelector, provideMockDispatcher } from '@household/shared-ui';
import { JobPriceSummary } from '@hairdressing/app/shared/job-price-summary/job-price-summary';
import { customerEvents } from '@hairdressing/state/customer/customer-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { timeSlotToTimeString } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatMenuItem } from '@angular/material/menu';

describe('CustomerDetailsJobItem', () => {
  const JobPriceSummaryStub = createStubComponent(JobPriceSummary);

  let fixture: ComponentFixture<CustomerDetailsJobItem>;
  let selector: IElementSelector;
  let mockDispatcher: Dispatcher;

  const customerId = testDataFactory.customer.id();
  const job = testDataFactory.customer.job.response({
    duration: 6,
  });

  const getSearchButton = () => {
    return selector.getElementByTestId<HTMLAnchorElement>('search-button');
  };

  const getMenuButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('menu-button');
  };

  const getEditButton = () => {
    return selector.getComponentByTestId<MatMenuItem, HTMLButtonElement>('edit-job-button');
  };

  const getDeleteButton = () => {
    return selector.getComponentByTestId<MatMenuItem, HTMLButtonElement>('delete-job-button');
  };

  const openMenu = async () => {
    getMenuButton().nativeElement.click();

    await fixture.whenStable();
  };

  const render = async (params?: {
    job?: Responses.CustomerJob;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsJobItem],
      providers: [
        provideMockDispatcher(),
        provideRouter([]),
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
      .overrideComponent(CustomerDetailsJobItem, {
        remove: {
          imports: [JobPriceSummary],
        },
        add: {
          imports: [JobPriceSummaryStub],
        },
      })
      .compileComponents();

    mockDispatcher = TestBed.inject(Dispatcher);

    fixture = TestBed.createComponent(CustomerDetailsJobItem);
    fixture.componentRef.setInput('job', params?.job ?? job);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('title', () => {
    it('should be the name of the job', async () => {
      await render();

      expect(selector.getComponent(MatCardTitle).nativeElement.textContent).toBe(job.name);
    });
  });

  describe('subtitle', () => {
    it('should be the duration of the job', async () => {
      await render();

      expect(selector.getComponent(MatCardSubtitle).nativeElement.textContent).toBe(`${timeSlotToTimeString(job.duration)} óra`);
    });
  });

  describe('job price summary', () => {
    it('should be rendered with the job', async () => {
      await render();

      expect(selector.getComponent<JobPriceSummary>(JobPriceSummaryStub).componentInstance.cost()).toEqual(job);
    });
  });

  describe('search button', () => {
    it('should link to the calendar with the customer and the job', async () => {
      await render();

      const href = new URL(getSearchButton().nativeElement.href);

      expect(getSearchButton().nativeElement.textContent).toContain('Időpont keresése');
      expect(href.pathname).toBe('/');
      expect(href.searchParams.get('customerId')).toBe(customerId);
      expect(href.searchParams.get('jobName')).toBe(job.name);
    });
  });

  describe('edit button', () => {
    it('should dispatch updateCustomerJob if clicked', async () => {
      await render();

      await openMenu();

      expect(getEditButton().nativeElement.textContent).toContain('Szerkesztés');

      getEditButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.updateCustomerJob({
        customerId,
        ...job,
      }), {
        scope: 'self',
      });
    });
  });

  describe('delete button', () => {
    it('should dispatch deleteCustomerJob if clicked', async () => {
      await render();

      await openMenu();

      expect(getDeleteButton().nativeElement.textContent).toContain('Törlés');

      getDeleteButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.deleteCustomerJob({
        customerId,
        name: job.name,
      }), {
        scope: 'self',
      });
    });
  });
});
