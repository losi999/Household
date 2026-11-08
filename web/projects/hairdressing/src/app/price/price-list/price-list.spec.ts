import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceList } from './price-list';
import { PriceListItem } from '@hairdressing/app/price/price-list-item/price-list-item';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';

describe('PriceList', () => {
  const PriceListItemStub = createStubComponent(PriceListItem);

  let fixture: ComponentFixture<PriceList>;
  let selector: IElementSelector;

  const prices = [
    testDataFactory.price.response(),
    testDataFactory.price.response(),
  ];

  const getItems = () => {
    return selector.listComponents<PriceListItem>(PriceListItemStub);
  };

  const render = async (priceList: Responses.Price[] = prices) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [PriceList],
    })
      .overrideComponent(PriceList, {
        remove: {
          imports: [PriceListItem],
        },
        add: {
          imports: [PriceListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PriceList);
    fixture.componentRef.setInput('prices', priceList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('price list items', () => {
    it('should be rendered for each price', async () => {
      await render();

      expect(getItems().map(i => i.componentInstance.price())).toEqual(prices);
    });

    it('should not be rendered for an empty list', async () => {
      await render([]);

      expect(getItems()).toEqual([]);
    });
  });
});
