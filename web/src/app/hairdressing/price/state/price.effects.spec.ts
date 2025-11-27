import { TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { PriceDialogResult } from '@household/web/app/hairdressing/price/price-dialog/price-dialog.component';
import { priceActions, priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { PriceEffects } from '@household/web/app/hairdressing/price/state/price.effects';
import { CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from '@household/web/services/dialog.service';
import { createMockService, expectEffectNotEmitted, Mock, returnBottomSheetAfterDismissed, returnDialogAfterClosed } from '@household/web/utils/unit-testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

describe('Price effects', () => {
  let actions$: Observable<any>;
  let effects: PriceEffects;
  let mockDialogService: Mock<DialogService>;
  let mockMatDialog: Mock<MatDialog>;
  let mockMatBottomSheet: Mock<MatBottomSheet>;

  beforeEach(() => {
    mockDialogService = createMockService('openConfirmationDialog');
    mockMatDialog = createMockService('open');
    mockMatBottomSheet = createMockService('open');

    TestBed.configureTestingModule({
      providers: [
        PriceEffects,
        provideMockActions(() => actions$),
        {
          provide: DialogService,
          useValue: mockDialogService,
        },
        {
          provide: MatDialog,
          useValue: mockMatDialog,
        },
        {
          provide: MatBottomSheet,
          useValue: mockMatBottomSheet,
        },
      ],
    });

    effects = TestBed.inject(PriceEffects);
  });

  describe('On Create price', () => {
    it('should dispatch [Price API] Create price initiated', () => {
      const request = testDataFactory.price.request();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<PriceDialogResult>(request));

      actions$ = of(priceActions.createPrice());

      effects.openCreatePriceDialog.subscribe((result) => {
        expect(result).toEqual(priceApiActions.createPriceInitiated(request));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<PriceDialogResult>());
    
      actions$ = of(priceActions.createPrice());
    
      expectEffectNotEmitted(effects.openCreatePriceDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ }));
      });
    });
  });

  describe('On Update price', () => {
    it('should dispatch [Price API] Update price initiated', () => {
      const priceResponse = testDataFactory.price.response();
      const request = testDataFactory.price.request();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<PriceDialogResult>(request));

      actions$ = of(priceActions.updatePrice(priceResponse));

      effects.openUpdatePriceDialog.subscribe((result) => {
        expect(result).toEqual(priceApiActions.updatePriceInitiated({
          priceId: priceResponse.priceId,
          ...request,
        }));
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: priceResponse,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const priceResponse = testDataFactory.price.response();

      mockMatDialog.open.mockReturnValue(returnDialogAfterClosed<PriceDialogResult>());
    
      actions$ = of(priceActions.updatePrice(priceResponse));
    
      expectEffectNotEmitted(effects.openUpdatePriceDialog, () => {
        expect(mockMatDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: priceResponse,
        }));
      });
    });
  });

  describe('On Delete price', () => {
    it('should dispatch [Price API] Delete price initiated', () => {
      const priceResponse = testDataFactory.price.response();

      mockDialogService.openConfirmationDialog.mockReturnValue(of(true));

      actions$ = of(priceActions.deletePrice(priceResponse));

      effects.openDeletePriceDialog.subscribe((result) => {
        expect(result).toEqual(priceApiActions.deletePriceInitiated({
          priceId: priceResponse.priceId,
        }));
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(expect.objectContaining({
          content: priceResponse.name,
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const priceResponse = testDataFactory.price.response();

      mockDialogService.openConfirmationDialog.mockReturnValue(of(false));
    
      actions$ = of(priceActions.deletePrice(priceResponse));
    
      expectEffectNotEmitted(effects.openDeletePriceDialog, () => {
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(expect.objectContaining({
          content: priceResponse.name,
        }));
      });
    });
  });

  describe('On Price list item submenu', () => {
    it('should dispatch [Price] Update price', () => {
      const priceResponse = testDataFactory.price.response();

      mockMatBottomSheet.open.mockReturnValue(returnBottomSheetAfterDismissed<CatalogSubmenuResult>(CatalogSubmenuResult.Edit));

      actions$ = of(priceActions.openPriceListItemSubmenu(priceResponse));

      effects.openPriceListItemSubmenu.subscribe((result) => {
        expect(result).toEqual(priceActions.updatePrice(priceResponse));
        expect(mockMatBottomSheet.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: {
            title: priceResponse.name,
            hideMerge: true,
          },
        }));
      });
    });

    it('should dispatch [Price] Delete price', () => {
      const priceResponse = testDataFactory.price.response();

      mockMatBottomSheet.open.mockReturnValue(returnBottomSheetAfterDismissed<CatalogSubmenuResult>(CatalogSubmenuResult.Delete));

      actions$ = of(priceActions.openPriceListItemSubmenu(priceResponse));

      effects.openPriceListItemSubmenu.subscribe((result) => {
        expect(result).toEqual(priceActions.deletePrice(priceResponse));
        expect(mockMatBottomSheet.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: {
            title: priceResponse.name,
            hideMerge: true,
          },
        }));
      });
    });

    it('should NOT dispatch if dialog is cancelled', () => {
      const priceResponse = testDataFactory.price.response();

      mockMatBottomSheet.open.mockReturnValue(returnBottomSheetAfterDismissed<CatalogSubmenuResult>());
    
      actions$ = of(priceActions.openPriceListItemSubmenu(priceResponse));
    
      expectEffectNotEmitted(effects.openPriceListItemSubmenu, () => {
        expect(mockMatBottomSheet.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
          data: {
            title: priceResponse.name,
            hideMerge: true,
          },
        }));
      });
    });
  });
});
