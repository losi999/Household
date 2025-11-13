import { TestBed } from '@angular/core/testing';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { PriceApiEffects } from '@household/web/app/hairdressing/price/state/price-api.effects';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { PriceService } from '@household/web/services/price.service';
import { notificationActions } from '@household/web/state/notification/notification.actions';
import { progressActions } from '@household/web/state/progress/progress.actions';
import { expectEffectMultipleEmission } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';

describe('Price API effects', () => {
  let actions$: Observable<any>;
  let effects: PriceApiEffects;
  let mockPriceService: jasmine.SpyObj<PriceService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PriceApiEffects,
        provideMockActions(() => actions$),
        {
          provide: PriceService,
          useValue: jasmine.createSpyObj<PriceService>('PriceService', [
            'listPrices',
            'createPrice',
            'updatePrice',
            'deletePrice',
          ]), 
        },
      ],
    });

    effects = TestBed.inject(PriceApiEffects);
    mockPriceService = TestBed.inject(PriceService) as jasmine.SpyObj<PriceService>;
  });

  describe('On List prices initiated', () => {
    it('should dispatch [Price API] List prices completed', (done) => {
      const priceResponse = testDataFactory.price.response();
      
      mockPriceService.listPrices.and.returnValue(of([priceResponse]));

      actions$ = of(priceApiActions.listPricesInitiated());

      effects.listPrices.subscribe((result) => {
        expect(result).toEqual(priceApiActions.listPricesCompleted({
          prices: [priceResponse],
        }));
      });
      expect(mockPriceService.listPrices).toHaveBeenCalledTimes(1);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      mockPriceService.listPrices.and.returnValue(throwError(() => new Error('Price API error')));
  
      actions$ = of(priceApiActions.listPricesInitiated());
  
      expectEffectMultipleEmission(effects.listPrices, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockPriceService.listPrices).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('On Create prices initiated', () => {
    it('should dispatch [Price API] Create prices completed', (done) => {
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.createPrice.and.returnValue(of({
        priceId,
      }));

      actions$ = of(priceApiActions.createPriceInitiated(request));

      effects.createPrice.subscribe((result) => {
        expect(result).toEqual(priceApiActions.createPriceCompleted({
          priceId,
          ...request,
        }));
      });
      expect(mockPriceService.createPrice).toHaveBeenCalledWith(request);
      done();      
    });
  
    it('should dispatch duplicate error if price name is already in use', (done) => { 
      const request = testDataFactory.price.request();
      
      mockPriceService.createPrice.and.returnValue(throwError(() => ({
        error: new Error('Duplicate price name'),
      })));

      actions$ = of(priceApiActions.createPriceInitiated(request));
  
      expectEffectMultipleEmission(effects.createPrice, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: `Árlista elem (${request.name}) már létezik!`,
        }),
      ], () => {
        expect(mockPriceService.createPrice).toHaveBeenCalledWith(request);
        done();
      });
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const request = testDataFactory.price.request();
      
      mockPriceService.createPrice.and.returnValue(throwError(() => new Error('Price API error')));

      actions$ = of(priceApiActions.createPriceInitiated(request));
  
      expectEffectMultipleEmission(effects.createPrice, [
        progressActions.processFinished(),
        notificationActions.showMessage({
          message: 'Hiba történt',
        }),
      ], () => {
        expect(mockPriceService.createPrice).toHaveBeenCalledWith(request);
        done();
      });
    });
  });

  describe('On Update prices initiated', () => {
    it('should dispatch [Price API] Update prices completed', (done) => {
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.updatePrice.and.returnValue(of({
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
      expect(mockPriceService.updatePrice).toHaveBeenCalledWith(priceId, request);
      done();      
    });
  
    it('should dispatch duplicate error if price name is already in use', (done) => { 
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.updatePrice.and.returnValue(throwError(() => ({
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
        expect(mockPriceService.updatePrice).toHaveBeenCalledWith(priceId, request);
        done();
      });
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const request = testDataFactory.price.request();
      const priceId = testDataFactory.price.id();
      
      mockPriceService.updatePrice.and.returnValue(throwError(() => new Error('Price API error')));

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
        expect(mockPriceService.updatePrice).toHaveBeenCalledWith(priceId, request);
        done();
      });
    });
  });

  describe('On Delete prices initiated', () => {
    it('should dispatch [Price API] Delete prices completed', (done) => {
      const priceId = testDataFactory.price.id();
      
      mockPriceService.deletePrice.and.returnValue(of({
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
      expect(mockPriceService.deletePrice).toHaveBeenCalledWith(priceId);
      done();      
    });
  
    it('should dispatch error if unable to get data from API', (done) => { 
      const priceId = testDataFactory.price.id();
      
      mockPriceService.deletePrice.and.returnValue(throwError(() => new Error('Price API error')));

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
        expect(mockPriceService.deletePrice).toHaveBeenCalledWith(priceId);
        done();
      });
    });
  });
});
