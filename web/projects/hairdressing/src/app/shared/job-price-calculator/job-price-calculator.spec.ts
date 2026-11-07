import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { PriceAutocompleteInput } from '@hairdressing/app/price/price-autocomplete-input/price-autocomplete-input';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { JobPriceCalculator, JobPriceCalculatorValue } from './job-price-calculator';

describe('JobPriceCalculator', () => {
  const PriceAutocompleteInputStub = createStubComponent(PriceAutocompleteInput);

  let fixture: ComponentFixture<JobPriceCalculator>;
  let selector: IElementSelector;

  const countPrice = testDataFactory.price.response({
    name: 'Darabos',
    unitOfMeasurement: 'db',
    amount: 1000,
  });
  const weightPrice = testDataFactory.price.response({
    name: 'Grammos',
    unitOfMeasurement: 'g',
    amount: 20,
  });
  const hourPrice = testDataFactory.price.response({
    name: 'Órás',
    unitOfMeasurement: 'óra',
    amount: 4000,
  });
  const newPrice = testDataFactory.price.response();

  const emptyValue: JobPriceCalculatorValue = {
    prices: [],
    additionalPrice: 0,
  };

  const value: JobPriceCalculatorValue = {
    prices: [
      {
        price: countPrice,
        quantity: 2,
      },
      {
        price: weightPrice,
        quantity: 30,
      },
      {
        price: hourPrice,
        quantity: 1.5,
      },
    ],
    additionalPrice: 500,
  };

  const getAutocomplete = () => {
    return selector.getComponent(PriceAutocompleteInputStub);
  };

  const getAddButton = () => {
    return selector.getComponent<MatButton, HTMLButtonElement>(MatButton, selector.getElementByCss('.prices'));
  };

  const getDetails = () => {
    return selector.getElementByCss('.detailed-price');
  };

  const getText = () => {
    return getDetails().nativeElement.textContent.replace(/\s+/g, ' ').trim();
  };

  const getQuantities = () => {
    return fixture.debugElement.queryAll(By.css('.quantity')).map(q => q.nativeElement.textContent.trim());
  };

  const getIconButtons = () => {
    return selector.listComponents<MatIconButton, HTMLButtonElement>(MatIconButton);
  };

  const getIncrementButtons = () => {
    return selector.listComponents<MatButton, HTMLButtonElement>(MatButton, selector.getElementByCss('.additional-price'));
  };

  // rows of three icon buttons (minus, plus, remove) per price, then the remove button of the additional price
  const getMinusButton = (index: number) => getIconButtons()[index * 3];
  const getPlusButton = (index: number) => getIconButtons()[index * 3 + 1];
  const getRemoveButton = (index: number) => getIconButtons()[index * 3 + 2];
  const getAdditionalRemoveButton = (valueCount: number) => getIconButtons()[valueCount * 3];

  const getErrors = () => {
    return selector.listComponents(MatError);
  };

  const hold = async (button: { nativeElement: HTMLElement }) => {
    button.nativeElement.dispatchEvent(new Event('pointerdown'));
    button.nativeElement.dispatchEvent(new Event('pointerup'));

    await fixture.whenStable();
  };

  const render = async (params?: {
    value?: JobPriceCalculatorValue;
    errors?: { kind: string; message: string }[];
    touched?: boolean;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [JobPriceCalculator],
    })
      .overrideComponent(JobPriceCalculator, {
        remove: {
          imports: [PriceAutocompleteInput],
        },
        add: {
          imports: [PriceAutocompleteInputStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(JobPriceCalculator);
    fixture.componentRef.setInput('value', params?.value ?? value);
    fixture.componentRef.setInput('errors', params?.errors ?? []);
    fixture.componentRef.setInput('touched', params?.touched ?? false);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('price autocomplete', () => {
    it('should be rendered with the label', async () => {
      await render();

      expect(getAutocomplete().componentInstance.label()).toBe('Ár kiválasztása');
    });

    it('should exclude the already added prices', async () => {
      await render();

      expect(getAutocomplete().componentInstance.exclude()).toEqual([
        countPrice.priceId,
        weightPrice.priceId,
        hourPrice.priceId,
      ]);
    });
  });

  describe('add button', () => {
    it('should be rendered with the label', async () => {
      await render();

      expect(getAddButton().nativeElement.textContent).toContain('Hozzáadás');
    });

    it('should be disabled if no price is selected', async () => {
      await render();

      expect(getAddButton().nativeElement.disabled).toBe(true);
    });

    it('should be enabled if a price is selected', async () => {
      await render();

      getAutocomplete().componentInstance.value.set(newPrice);
      await fixture.whenStable();

      expect(getAddButton().nativeElement.disabled).toBe(false);
    });

    it('should add the selected price with quantity 1 and clear the selection', async () => {
      await render();

      getAutocomplete().componentInstance.value.set(newPrice);
      await fixture.whenStable();

      getAddButton().nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value().prices).toEqual([
        ...value.prices,
        {
          price: newPrice,
          quantity: 1,
        },
      ]);
      expect(getAutocomplete().componentInstance.value()).toBeUndefined();
      expect(getAddButton().nativeElement.disabled).toBe(true);
    });

    it('should increase the quantity if the selected price was already added', async () => {
      await render();

      getAutocomplete().componentInstance.value.set(countPrice);
      await fixture.whenStable();

      getAddButton().nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value().prices.map(p => p.quantity)).toEqual([
        3,
        30,
        1.5,
      ]);
    });

    it('should do nothing if called without a selected price', async () => {
      await render();

      fixture.componentInstance.onAddPrice();
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toEqual(value);
    });
  });

  describe('price rows', () => {
    it('should render the names and the amounts', async () => {
      await render();

      const text = getText();
      expect(text).toContain('Darabos');
      expect(text).toContain('Grammos');
      expect(text).toContain('Órás');
      expect(text).toContain('2000 Ft');
      expect(text).toContain('600 Ft');
      expect(text).toContain('6000 Ft');
    });

    it('should render the quantity based on the unit of measurement', async () => {
      await render();

      expect(getQuantities()).toEqual([
        '2',
        '30 g',
        '1:30 óra',
      ]);
    });

    it('should render no rows for an empty value', async () => {
      await render({
        value: emptyValue,
      });

      expect(getIconButtons()).toHaveLength(1);
    });
  });

  describe('plus button', () => {
    it('should increase a piece based quantity by 1', async () => {
      await render();

      await hold(getPlusButton(0));

      expect(fixture.componentInstance.value().prices[0].quantity).toBe(3);
    });

    it('should increase a weight based quantity by 1', async () => {
      await render();

      await hold(getPlusButton(1));

      expect(fixture.componentInstance.value().prices[1].quantity).toBe(31);
    });

    it('should increase an hour based quantity by a quarter', async () => {
      await render();

      await hold(getPlusButton(2));

      expect(fixture.componentInstance.value().prices[2].quantity).toBe(1.75);
    });
  });

  describe('minus button', () => {
    it('should decrease a piece based quantity by 1', async () => {
      await render();

      await hold(getMinusButton(0));

      expect(fixture.componentInstance.value().prices[0].quantity).toBe(1);
    });

    it('should decrease an hour based quantity by a quarter', async () => {
      await render();

      await hold(getMinusButton(2));

      expect(fixture.componentInstance.value().prices[2].quantity).toBe(1.25);
    });

    it('should remove the price if the quantity reaches zero', async () => {
      await render({
        value: {
          prices: [
            {
              price: countPrice,
              quantity: 1,
            },
          ],
          additionalPrice: 0,
        },
      });

      await hold(getMinusButton(0));

      expect(fixture.componentInstance.value().prices).toEqual([]);
    });
  });

  describe('remove button', () => {
    it('should remove the price of the row', async () => {
      await render();

      getRemoveButton(1).nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value().prices.map((p: { price: Responses.Price }) => p.price)).toEqual([
        countPrice,
        hourPrice,
      ]);
    });
  });

  describe('additional price', () => {
    it('should render the increment buttons', async () => {
      await render();

      expect(getIncrementButtons().map(b => b.nativeElement.textContent.trim())).toEqual([
        '-5000 Ft',
        '-1000 Ft',
        '-500 Ft',
        '-100 Ft',
        '+100 Ft',
        '+500 Ft',
        '+1000 Ft',
        '+5000 Ft',
      ]);
    });

    it('should render the current additional price', async () => {
      await render();

      expect(getText()).toContain('500 Ft');
    });

    it('should add the increment of the clicked button', async () => {
      await render();

      getIncrementButtons()[6].nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value().additionalPrice).toBe(1500);
    });

    it('should subtract the decrement of the clicked button', async () => {
      await render();

      getIncrementButtons()[2].nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value().additionalPrice).toBe(0);
    });

    it('should be reset to zero by the remove button', async () => {
      await render();

      getAdditionalRemoveButton(value.prices.length).nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value().additionalPrice).toBe(0);
    });
  });

  describe('total', () => {
    it('should be the sum of the prices and the additional price', async () => {
      await render();

      expect(getText()).toMatch(/Összesen ?9100 Ft/);
    });

    it('should be updated when the value changes', async () => {
      await render();

      getIncrementButtons()[7].nativeElement.click();
      await fixture.whenStable();

      expect(getText()).toMatch(/Összesen ?14100 Ft/);
    });
  });

  describe('errors', () => {
    const errors = [
      {
        kind: 'requiredPrices',
        message: 'Legalább egy ár szükséges',
      },
    ];

    it('should not be rendered if not touched', async () => {
      await render({
        errors,
      });

      expect(getErrors()).toHaveLength(0);
    });

    it('should be rendered if touched', async () => {
      await render({
        errors,
        touched: true,
      });

      expect(getErrors().map(e => e.nativeElement.textContent.trim())).toEqual(['Legalább egy ár szükséges']);
    });

    it('should be rendered after the user changed something', async () => {
      await render({
        errors,
      });

      getIncrementButtons()[4].nativeElement.click();
      await fixture.whenStable();

      expect(getErrors()).toHaveLength(1);
    });
  });
});
