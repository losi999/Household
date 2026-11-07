import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailsWorks } from './customer-details-works';
import { createStubComponent, elementSelectorFactory, IconText, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { MatPaginator } from '@angular/material/paginator';
import { MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { timeSlotToTimeString } from '@household/shared/common/utils';

describe('CustomerDetailsWorks', () => {
  const IconTextStub = createStubComponent(IconText);

  let fixture: ComponentFixture<CustomerDetailsWorks>;
  let selector: IElementSelector;

  const works = [
    testDataFactory.calendar.entry.response.workBase(),
    testDataFactory.calendar.entry.response.workBase(),
    testDataFactory.calendar.entry.response.workBase(),
  ];

  const getIconText = () => {
    return selector.getComponent<IconText>(IconTextStub);
  };

  const getPaginator = () => {
    return selector.getComponent<MatPaginator>(MatPaginator);
  };

  const getItems = () => {
    return selector.listComponents<MatListItem>(MatListItem);
  };

  const render = async (params?: {
    works?: Responses.CalendarEntryWorkLean[];
    pageSize?: number;
    title?: string;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsWorks],
    })
      .overrideComponent(CustomerDetailsWorks, {
        remove: {
          imports: [IconText],
        },
        add: {
          imports: [IconTextStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsWorks);
    fixture.componentRef.setInput('works', params?.works ?? works);
    fixture.componentRef.setInput('title', params?.title ?? 'Korábbi időpontok');

    if (params?.pageSize) {
      fixture.componentRef.setInput('pageSize', params.pageSize);
    }

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('with no works', () => {
    it('should not render anything', async () => {
      await render({
        works: [],
      });

      expect(getIconText()).toBeFalsy();
      expect(getPaginator()).toBeFalsy();
      expect(getItems()).toEqual([]);
    });
  });

  describe('title', () => {
    it('should be rendered', async () => {
      await render({
        title: 'Következő időpontok',
      });

      expect(getIconText().componentInstance.text()).toBe('Következő időpontok');
      expect(getIconText().componentInstance.icon()).toBe('calendar_clock');
    });
  });

  describe('work items', () => {
    it('should be rendered with day, time and title', async () => {
      await render();

      const datePipe = new DatePipe('en-US');

      expect(selector.listComponents(MatListItemTitle).map(i => i.nativeElement.textContent)).toEqual(works.map((w) => {
        return `${datePipe.transform(w.day, 'yyyy. MMMM d., EEEE')} ${timeSlotToTimeString(w.start)}-${timeSlotToTimeString(w.end)}`;
      }));
      expect(selector.listComponents(MatListItemLine).map(i => i.nativeElement.textContent)).toEqual(works.map(w => w.title));
    });
  });

  describe('paginator', () => {
    it('should be rendered with the number of works', async () => {
      await render();

      expect(getPaginator().componentInstance.length).toBe(works.length);
      expect(getPaginator().componentInstance.pageSize).toBe(5);
    });

    it('should limit the displayed items to the page size', async () => {
      await render({
        pageSize: 2,
      });

      expect(getPaginator().componentInstance.pageSize).toBe(2);
      expect(getItems().length).toBe(2);
    });

    it('should display the next items after a page change', async () => {
      await render({
        pageSize: 2,
      });

      getPaginator().componentInstance.nextPage();

      await fixture.whenStable();

      expect(selector.listComponents(MatListItemLine).map(i => i.nativeElement.textContent)).toEqual([works[2].title]);
    });
  });
});
