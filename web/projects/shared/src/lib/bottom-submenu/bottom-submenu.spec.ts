import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSubmenu, BottomSubmenuData } from './bottom-submenu';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { MatActionList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { provideRouter, Router } from '@angular/router';
import { MockInstance } from 'vitest';

describe('BottomSubmenu', () => {
  let fixture: ComponentFixture<BottomSubmenu>;
  let mockBottomSheetRef: MockService<MatBottomSheetRef>;
  let selector: IElementSelector;
  let navigateSpy: MockInstance<Router['navigateByUrl']>;

  const title = 'submenu title';
  const items: BottomSubmenuData['items'] = [
    {
      action: 'action1',
      icon: 'icon1',
      label: 'label1',
    },
    {
      action: 'action2',
      icon: 'icon2',
      label: 'label2',
    },
  ];

  const getListItems = () => {
    return selector.listComponents<MatListItem, HTMLElement>(MatListItem, MatActionList);
  };

  const render = async (renderedItems: BottomSubmenuData['items'] = items) => {
    TestBed.resetTestingModule();

    mockBottomSheetRef = createMockService('dismiss');

    await TestBed.configureTestingModule({
      imports: [BottomSubmenu],
      providers: [
        provideRouter([]),
        {
          provide: MatBottomSheetRef,
          useValue: mockBottomSheetRef.service,
        },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: {
            title,
            items: renderedItems,
          } satisfies BottomSubmenuData,
        },
      ],
    })
      .compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(BottomSubmenu);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('title', () => {
    it('should be rendered', async () => {
      await render();

      const titleElement = selector.getElementByCss('h2');

      expect(titleElement.nativeElement.textContent).toBe(title);
    });
  });

  describe('list of buttons', () => {
    it('should be rendered', async () => {
      await render();

      const listItems = getListItems();

      expect(listItems).toHaveLength(items.length);
      listItems.forEach((listItem, index) => {
        expect(selector.getComponent(MatListItemIcon, listItem).nativeElement.textContent).toBe(items[index].icon);
        expect(selector.getComponent(MatListItemTitle, listItem).nativeElement.textContent).toBe(items[index].label);
      });
    });

    it('should omit the items that have neither action nor link', async () => {
      await render([
        {
          icon: 'icon1',
          label: 'label1',
        },
        {
          action: 'action2',
          icon: 'icon2',
          label: 'label2',
        },
        {
          link: '/target',
          icon: 'icon3',
          label: 'label3',
        },
      ]);

      const labels = getListItems().map(listItem => selector.getComponent(MatListItemTitle, listItem).nativeElement.textContent);

      expect(labels).toEqual([
        'label2',
        'label3',
      ]);
    });
  });

  describe('list item with action', () => {
    it('should dismiss bottom sheet with the action if clicked', async () => {
      await render();

      getListItems()[0].nativeElement.click();

      validateFunctionCall(mockBottomSheetRef.functions.dismiss, items[0].action);
    });

    it('should not have a link', async () => {
      await render();

      expect(getListItems()[0].nativeElement.getAttribute('href')).toBeNull();
    });
  });

  describe('list item with link', () => {
    const itemsWithLink: BottomSubmenuData['items'] = [
      {
        action: 'action1',
        link: '/target',
        icon: 'icon1',
        label: 'label1',
      },
    ];

    it('should navigate to the link, even if there is an action as well', async () => {
      await render(itemsWithLink);

      getListItems()[0].nativeElement.click();

      expect(navigateSpy).toHaveBeenCalledTimes(1);
      expect(navigateSpy.mock.calls[0][0].toString()).toBe('/target');
    });

    it('should be an anchor with the link as href, so it can be opened in a new tab', async () => {
      await render(itemsWithLink);

      const element = getListItems()[0].nativeElement;

      expect(element.tagName).toBe('A');
      expect(element.getAttribute('href')).toBe('/target');
    });

    it('should dismiss bottom sheet without an action if clicked', async () => {
      await render(itemsWithLink);

      getListItems()[0].nativeElement.click();

      validateFunctionCall(mockBottomSheetRef.functions.dismiss, undefined);
    });
  });
});
