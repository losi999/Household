import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSubmenu, BottomSubmenuData } from './bottom-submenu';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { MatActionList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';

describe('BottomSubmenu', () => {
  let fixture: ComponentFixture<BottomSubmenu>;
  let mockBottomSheetRef: MockService<MatBottomSheetRef>;
  let selector: IElementSelector;

  const title = 'submenu title';
  const bottomSubmenuData: BottomSubmenuData = {
    title,
    items: [
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
    ],
  };

  beforeEach(async () => {
    mockBottomSheetRef = createMockService('dismiss');

    await TestBed.configureTestingModule({
      imports: [BottomSubmenu],
      providers: [
        {
          provide: MatBottomSheetRef,
          useValue: mockBottomSheetRef.service, 
        },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: bottomSubmenuData,
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BottomSubmenu);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  });

  describe('title', () => {
    it('should be rendered', () => {
      const titleElement = selector.getElementByCss('h2');

      expect(titleElement.nativeElement.textContent).toBe(title);
    });
  });

  describe('list of buttons', () => {
    it('should be rendered', () => {
      const listElement = selector.getComponent(MatActionList);

      listElement.children.forEach((listItem, index) => {
        expect(listItem.attributes['mat-list-item']).toBeDefined();

        expect(selector.getComponent(MatListItemIcon, listItem).nativeElement.textContent).toBe(bottomSubmenuData.items[index].icon);
        expect(selector.getComponent(MatListItemTitle, listItem).nativeElement.textContent).toBe(bottomSubmenuData.items[index].label);
      });
    });
  });

  describe('list item', () => {
    it('should dismiss bottom sheet if clicked', () => {
      const listItemElement = selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem, MatActionList);
      listItemElement.nativeElement.click();

      validateFunctionCall(mockBottomSheetRef.functions.dismiss, bottomSubmenuData.items[0].action);
    });
  });
});
