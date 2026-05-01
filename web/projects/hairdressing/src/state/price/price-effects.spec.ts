// import { TestBed } from '@angular/core/testing';
// import { MatBottomSheet } from '@angular/material/bottom-sheet';
// import { MatDialog } from '@angular/material/dialog';
// import { testDataFactory } from '@household/shared/common/test-data-factory';
// import { PriceDialogResult } from '@household/web/app/hairdressing/price/price-dialog/price-dialog.component';
// import { priceActions, priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
// import { PriceEffects } from '@household/web/app/hairdressing/price/state/price.effects';
// import { CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
// import { DialogService } from '@household/web/services/dialog.service';
// import { expectEffectNotEmitted, returnBottomSheetAfterDismissed, returnDialogAfterClosed } from '@household/web/utils/unit-testing';
// import { provideMockActions } from '@ngrx/effects/testing';
// import { Observable, of } from 'rxjs';

// describe('Price effects', () => {
//   let actions$: Observable<any>;
//   let effects: PriceEffects;
//   let mockDialogService: jasmine.SpyObj<DialogService>;
//   let mockMatDialog: jasmine.SpyObj<MatDialog>;
//   let mockMatBottomSheet: jasmine.SpyObj<MatBottomSheet>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         PriceEffects,
//         provideMockActions(() => actions$),
//         {
//           provide: DialogService,
//           useValue: jasmine.createSpyObj<DialogService>('DialogService', ['openConfirmationDialog']), 
//         },
//         {
//           provide: MatDialog,
//           useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open']), 
//         },
//         {
//           provide: MatBottomSheet,
//           useValue: jasmine.createSpyObj<MatBottomSheet>('MatBottomSheet', ['open']), 
//         },
//       ],
//     });

//     effects = TestBed.inject(PriceEffects);
//     mockMatDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
//     mockMatBottomSheet = TestBed.inject(MatBottomSheet) as jasmine.SpyObj<MatBottomSheet>;
//     mockDialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
//   });

//   describe('On Create price', () => {
//     it('should dispatch [Price API] Create price initiated', (done) => {
//       const request = testDataFactory.price.request();

//       mockMatDialog.open.and.returnValue(returnDialogAfterClosed<PriceDialogResult>(request));

//       actions$ = of(priceActions.createPrice());

//       effects.openCreatePriceDialog.subscribe((result) => {
//         expect(result).toEqual(priceApiActions.createPriceInitiated(request));
//         expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({ }));
//         done();
//       });
//     });

//     it('should NOT dispatch if dialog is cancelled', (done) => {
//       mockMatDialog.open.and.returnValue(returnDialogAfterClosed<PriceDialogResult>());
    
//       actions$ = of(priceActions.createPrice());
    
//       expectEffectNotEmitted(effects.openCreatePriceDialog, () => {
//         expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({ }));
//         done();
//       });
//     });
//   });

//   describe('On Update price', () => {
//     it('should dispatch [Price API] Update price initiated', (done) => {
//       const priceResponse = testDataFactory.price.response();
//       const request = testDataFactory.price.request();

//       mockMatDialog.open.and.returnValue(returnDialogAfterClosed<PriceDialogResult>(request));

//       actions$ = of(priceActions.updatePrice(priceResponse));

//       effects.openUpdatePriceDialog.subscribe((result) => {
//         expect(result).toEqual(priceApiActions.updatePriceInitiated({
//           priceId: priceResponse.priceId,
//           ...request,
//         }));
//         expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
//           data: priceResponse,
//         }));
//         done();
//       });
//     });

//     it('should NOT dispatch if dialog is cancelled', (done) => {
//       const priceResponse = testDataFactory.price.response();

//       mockMatDialog.open.and.returnValue(returnDialogAfterClosed<PriceDialogResult>());
    
//       actions$ = of(priceActions.updatePrice(priceResponse));
    
//       expectEffectNotEmitted(effects.openUpdatePriceDialog, () => {
//         expect(mockMatDialog.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
//           data: priceResponse,
//         }));
//         done();
//       });
//     });
//   });

//   describe('On Delete price', () => {
//     it('should dispatch [Price API] Delete price initiated', (done) => {
//       const priceResponse = testDataFactory.price.response();

//       mockDialogService.openConfirmationDialog.and.returnValue(of(true));

//       actions$ = of(priceActions.deletePrice(priceResponse));

//       effects.openDeletePriceDialog.subscribe((result) => {
//         expect(result).toEqual(priceApiActions.deletePriceInitiated({
//           priceId: priceResponse.priceId,
//         }));
//         expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
//           content: priceResponse.name,
//         }));
//         done();
//       });
//     });

//     it('should NOT dispatch if dialog is cancelled', (done) => {
//       const priceResponse = testDataFactory.price.response();

//       mockDialogService.openConfirmationDialog.and.returnValue(of(false));
    
//       actions$ = of(priceActions.deletePrice(priceResponse));
    
//       expectEffectNotEmitted(effects.openDeletePriceDialog, () => {
//         expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith(jasmine.objectContaining({
//           content: priceResponse.name,
//         }));
//         done();
//       });
//     });
//   });

//   describe('On Price list item submenu', () => {
//     it('should dispatch [Price] Update price', (done) => {
//       const priceResponse = testDataFactory.price.response();

//       mockMatBottomSheet.open.and.returnValue(returnBottomSheetAfterDismissed<CatalogSubmenuResult>(CatalogSubmenuResult.Edit));

//       actions$ = of(priceActions.openPriceListItemSubmenu(priceResponse));

//       effects.openPriceListItemSubmenu.subscribe((result) => {
//         expect(result).toEqual(priceActions.updatePrice(priceResponse));
//         expect(mockMatBottomSheet.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
//           data: {
//             title: priceResponse.name,
//             hideMerge: true,
//           },
//         }));
//         done();
//       });
//     });

//     it('should dispatch [Price] Delete price', (done) => {
//       const priceResponse = testDataFactory.price.response();

//       mockMatBottomSheet.open.and.returnValue(returnBottomSheetAfterDismissed<CatalogSubmenuResult>(CatalogSubmenuResult.Delete));

//       actions$ = of(priceActions.openPriceListItemSubmenu(priceResponse));

//       effects.openPriceListItemSubmenu.subscribe((result) => {
//         expect(result).toEqual(priceActions.deletePrice(priceResponse));
//         expect(mockMatBottomSheet.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
//           data: {
//             title: priceResponse.name,
//             hideMerge: true,
//           },
//         }));
//         done();
//       });
//     });

//     it('should NOT dispatch if dialog is cancelled', (done) => {
//       const priceResponse = testDataFactory.price.response();

//       mockMatBottomSheet.open.and.returnValue(returnBottomSheetAfterDismissed<CatalogSubmenuResult>());
    
//       actions$ = of(priceActions.openPriceListItemSubmenu(priceResponse));
    
//       expectEffectNotEmitted(effects.openPriceListItemSubmenu, () => {
//         expect(mockMatBottomSheet.open).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
//           data: {
//             title: priceResponse.name,
//             hideMerge: true,
//           },
//         }));
//         done();
//       });
//     });
//   });
// });
