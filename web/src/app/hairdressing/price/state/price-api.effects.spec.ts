import { TestBed } from '@angular/core/testing';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { PriceApiEffects } from '@household/web/app/hairdressing/price/state/price-api.effects';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { PriceService } from '@household/web/services/price.service';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { createMockService, expectEffectMultipleEmission, Mock, validateFunctionCall } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

describe('Price API effects', () => {
  let actions$: Observable<any>;
  let effects: PriceApiEffects;
  let mockPriceService: Mock<PriceService>;

  beforeEach(() => {
    mockPriceService = createMockService('listPrices', 'createPrice', 'updatePrice', 'deletePrice');
    TestBed.configureTestingModule({
      providers: [
        PriceApiEffects,
        provideMockActions(() => actions$),
        {
          provide: PriceService,
          useValue: mockPriceService,
        },
      ],
    });

    effects = TestBed.inject(PriceApiEffects);
  });

  describe('On List prices initiated', () => {
    it('should dispatch [Price API] List prices completed', () => {
      const priceResponse = testDataFactory.price.response();
      
      mockPriceService.listPrices.mockReturnValue(of([priceResponse]));

      actions$ = of(priceApiActions.listPricesInitiated());

      effects.listPrices.subscribe((result) => {
        expect(result).toEqual(priceApiActions.listPricesCompleted({
          prices: [priceResponse],
        }));
      });
      expect(mockPriceService.listPrices).toHaveBeenCalledTimes(1);      
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      mockPriceService.listPrices.mockReturnValue(throwError(() => new Error('Price API error')));
  
      actions$ = of(priceApiActions.listPricesInitiated());
  
      expectEffectMultipleEmission(effects.listPrices, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockPriceService.listPrices).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('On Create price initiated', () => {
    it('should dispatch [Price API] Create price completed', () => {
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.createPrice.mockReturnValue(of({
        priceId,
      }));

      actions$ = of(priceApiActions.createPriceInitiated(request));

      effects.createPrice.subscribe((result) => {
        expect(result).toEqual(priceApiActions.createPriceCompleted({
          priceId,
          ...request,
        }));
      });
      validateFunctionCall(mockPriceService.createPrice, request);      
    });
  
    it('should dispatch duplicate error if price name is already in use', () => { 
      const request = testDataFactory.price.request();
      
      mockPriceService.createPrice.mockReturnValue(throwError(() => ({
        error: new Error('Duplicate price name'),
      })));

      actions$ = of(priceApiActions.createPriceInitiated(request));
  
      expectEffectMultipleEmission(effects.createPrice, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Árlista elem (${request.name}) már létezik!`,
        }),
      ], () => {
        validateFunctionCall(mockPriceService.createPrice, request);
      });
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const request = testDataFactory.price.request();
      
      mockPriceService.createPrice.mockReturnValue(throwError(() => new Error('Price API error')));

      actions$ = of(priceApiActions.createPriceInitiated(request));
  
      expectEffectMultipleEmission(effects.createPrice, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockPriceService.createPrice, request);
      });
    });
  });

  describe('On Update price initiated', () => {
    it('should dispatch [Price API] Update price completed', () => {
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.updatePrice.mockReturnValue(of({
        priceId,
      }));

      actions$ = of(priceApiActions.updatePriceInitiated({
        priceId,
        ...request,
      }));

      effects.updatePrice.subscribe((result) => {
        expect(result).toEqual(priceApiActions.updatePriceCompleted({
          priceId,
          ...request,
        }));
      });
      validateFunctionCall(mockPriceService.updatePrice, priceId, request);      
    });
  
    it('should dispatch duplicate error if price name is already in use', () => { 
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.updatePrice.mockReturnValue(throwError(() => ({
        error: new Error('Duplicate price name'),
      })));

      actions$ = of(priceApiActions.updatePriceInitiated({
        priceId,
        ...request,
      }));
  
      expectEffectMultipleEmission(effects.updatePrice, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Árlista elem (${request.name}) már létezik!`,
        }),
      ], () => {
        validateFunctionCall(mockPriceService.updatePrice, priceId, request);
      });
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.updatePrice.mockReturnValue(throwError(() => new Error('Price API error')));

      actions$ = of(priceApiActions.updatePriceInitiated({
        priceId,
        ...request,
      }));
  
      expectEffectMultipleEmission(effects.updatePrice, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockPriceService.updatePrice, priceId, request);
      });
    });
  });

  describe('On Delete price initiated', () => {
    it('should dispatch [Price API] Delete price completed', () => {
      const priceId = testDataFactory.price.id();
      
      mockPriceService.deletePrice.mockReturnValue(of({
        priceId,
      }));

      actions$ = of(priceApiActions.deletePriceInitiated({
        priceId,
      }));

      effects.deletePrice.subscribe((result) => {
        expect(result).toEqual(priceApiActions.deletePriceCompleted({
          priceId,
        }));
      });
      validateFunctionCall(mockPriceService.deletePrice, priceId);      
    });
  
    it('should dispatch error if unable to get data from API', () => { 
      const priceId = testDataFactory.price.id();
      
      mockPriceService.deletePrice.mockReturnValue(throwError(() => new Error('Price API error')));

      actions$ = of(priceApiActions.deletePriceInitiated({
        priceId,
      }));
  
      expectEffectMultipleEmission(effects.deletePrice, [
        priceApiActions.deletePriceFailed({
          priceId,
        }),
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        validateFunctionCall(mockPriceService.deletePrice, priceId);
      });
    });
  });
});
