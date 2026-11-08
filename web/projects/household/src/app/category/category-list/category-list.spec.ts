import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryList } from './category-list';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { CategoryListItem } from '@household/app/category/category-list-item/category-list-item';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { MatActionList } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';

describe('CategoryList', () => {
  const CategoryListItemStub = createStubComponent(CategoryListItem);

  let fixture: ComponentFixture<CategoryList>;
  let selector: IElementSelector;

  const categories = [
    testDataFactory.category.response(),
    testDataFactory.category.response(),
  ];

  const render = async (categoryList: Responses.Category[]) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CategoryList],
    })
      .overrideComponent(CategoryList, {
        remove: {
          imports: [CategoryListItem],
        },
        add: {
          imports: [CategoryListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryList);
    fixture.componentRef.setInput('categories', categoryList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('action list', () => {
    it('should be rendered', async () => {
      await render(categories);

      expect(selector.getComponent(MatActionList)).toBeTruthy();
    });
  });

  describe('list items', () => {
    it('should be rendered for each category', async () => {
      await render(categories);

      const listItems = selector.listComponents<CategoryListItem>(CategoryListItemStub, MatActionList);

      expect(listItems.length).toBe(categories.length);
      listItems.forEach((listItem, index) => {
        expect(listItem.componentInstance.category()).toEqual(categories[index]);
      });
    });

    it('should not be rendered if there are no categories', async () => {
      await render([]);

      expect(selector.listComponents(CategoryListItemStub, MatActionList).length).toBe(0);
    });
  });
});
