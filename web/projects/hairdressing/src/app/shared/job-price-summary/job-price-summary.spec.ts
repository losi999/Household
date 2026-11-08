import { ComponentFixture, TestBed } from '@angular/core/testing';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { JobPriceSummary } from './job-price-summary';

describe('JobPriceSummary', () => {
  let fixture: ComponentFixture<JobPriceSummary>;
  let selector: IElementSelector;

  const countPrice = testDataFactory.price.response({
    unitOfMeasurement: 'db',
    amount: 1000,
  });
  const weightPrice = testDataFactory.price.response({
    unitOfMeasurement: 'g',
    amount: 20,
  });
  const hourPrice = testDataFactory.price.response({
    unitOfMeasurement: 'óra',
    amount: 4000,
  });

  const cost: Responses.CustomerJobCost = {
    additionalPrice: 500,
    prices: [
      {
        ...countPrice,
        quantity: 2,
      },
      {
        ...weightPrice,
        quantity: 30,
      },
      {
        ...hourPrice,
        quantity: 1.5,
      },
    ],
  };

  const getContent = () => {
    return selector.getElementByCss('.prices').nativeElement.textContent.replace(/\s+/g, ' ').trim();
  };

  const render = async (costValue: Responses.CustomerJobCost = cost) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [JobPriceSummary],
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobPriceSummary);
    fixture.componentRef.setInput('cost', costValue);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('price rows', () => {
    it('should render the name of every price', async () => {
      await render();

      const content = getContent();
      expect(content).toContain(countPrice.name);
      expect(content).toContain(weightPrice.name);
      expect(content).toContain(hourPrice.name);
    });

    it('should render the quantity of a piece based price', async () => {
      await render();

      expect(getContent()).toContain('2x');
    });

    it('should render the quantity of a weight based price in grams', async () => {
      await render();

      expect(getContent()).toContain('30 g');
    });

    it('should render the quantity of an hour based price as hours', async () => {
      await render();

      expect(getContent()).toContain('1:30 óra');
    });

    it('should render the amount multiplied by the quantity', async () => {
      await render();

      const content = getContent();
      expect(content).toContain('2000 Ft');
      expect(content).toContain('600 Ft');
      expect(content).toContain('6000 Ft');
    });
  });

  describe('additional price', () => {
    it('should be rendered if set', async () => {
      await render();

      expect(getContent()).toContain('Egyéni 500 Ft');
    });

    it('should not be rendered if zero', async () => {
      await render({
        ...cost,
        additionalPrice: 0,
      });

      expect(getContent()).not.toContain('Egyéni');
    });
  });

  describe('total', () => {
    it('should be the sum of the prices and the additional price', async () => {
      await render();

      expect(getContent()).toMatch(/9100 Ft$/);
    });

    it('should not include an additional price if not set', async () => {
      await render({
        ...cost,
        additionalPrice: undefined,
      });

      expect(getContent()).toMatch(/8600 Ft$/);
    });
  });
});
