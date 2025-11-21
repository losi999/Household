import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailsWorksComponent } from '@household/web/app/hairdressing/customer/customer-details-works/customer-details-works.component';
import { Calendar } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { IconTextComponent } from '@household/web/app/shared/icon-text/icon-text.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatLine } from '@angular/material/core';
import { MatList, MatListItemLine } from '@angular/material/list';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';

describe('CustomerDetailsWorksComponent', () => {
  let component: CustomerDetailsWorksComponent;
  let fixture: ComponentFixture<CustomerDetailsWorksComponent>;
  let works: Calendar.Entry.WorkEntryResponseBase[];
  let pageSize: number;
  let title: string;
  let selector: IElementSelector;

  beforeEach(async () => {
    works = [
      testDataFactory.calendar.entry.response.workBase(),
      testDataFactory.calendar.entry.response.workBase(),
      testDataFactory.calendar.entry.response.workBase(),
      testDataFactory.calendar.entry.response.workBase(),
    ];
    title = 'title';
    pageSize = 2;

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsWorksComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsWorksComponent);
    component = fixture.componentInstance;
    
    selector = elementSelectorFactory(fixture.debugElement);
  });

  describe('title', () => {
    it('should NOT be rendered if there are no work items', () => {
      const titleElement = selector.getComponent(IconTextComponent);
      expect(titleElement).toBeNull();
    });

    it('should be rendered if there are work items', () => {
      component.works = works;      
      component.title = title;

      fixture.detectChanges();

      const titleElement = selector.getComponent(IconTextComponent);

      expect(titleElement).toBeTruthy();
      expect(titleElement.componentInstance.text).toEqual(title);
    });
  });

  describe('paginator', () => {
    it('should NOT be rendered if there are no work items', () => {
      const paginator = selector.getComponent(MatPaginator);
      expect(paginator).toBeNull();
    });

    it('should be rendered if there are work items', () => {
      component.works = works;      
      component.title = title;
      component.pageSize = pageSize;

      fixture.detectChanges();

      const paginatorElement = selector.getComponent(MatPaginator);

      expect(paginatorElement).toBeTruthy();
      expect(paginatorElement.componentInstance.length).toEqual(works.length);
      expect(paginatorElement.componentInstance.pageSize).toEqual(pageSize);
    });
  });

  describe('list items', () => {
    it('should NOT be rendered if there are no work items', () => {
      const list = selector.getComponent(MatLine);
      expect(list).toBeNull();
    });

    it('should be rendered if there are work items', () => {
      component.works = works;      
      component.title = title;
      component.pageSize = pageSize;

      fixture.detectChanges();

      const list = selector.getComponent(MatList);

      expect(list).toBeTruthy();
      expect(list.children.length).toEqual(pageSize);
      list.children.forEach((child, index) => {
        const titleLine = selector.getComponent(MatListItemLine, child);
        expect(titleLine.nativeElement.textContent).toEqual(works[index].title);
      });
    });

    it('should render works from 2nd page if pagination button is clicked', () => {
      component.works = works;      
      component.title = title;
      component.pageSize = pageSize;
      
      fixture.detectChanges();

      const nextButton = selector.getElementByCss<HTMLButtonElement>('.mat-mdc-paginator-navigation-next', MatPaginator).nativeElement;
      nextButton.click();
      
      fixture.detectChanges();

      const list = selector.getComponent(MatList);

      expect(list).toBeTruthy();
      expect(list.children.length).toEqual(pageSize);
      list.children.forEach((child, index) => {
        const titleLine = selector.getComponent(MatListItemLine, child);
        expect(titleLine.nativeElement.textContent).toEqual(works[index + pageSize].title);
      });
    });
  });
});
