import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TransactionHome } from './transaction-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { TransactionStore } from '@household/state/transaction/transaction-store';
import { transactionApiEvents } from '@household/state/transaction/transaction-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { Api } from '@household/shared/types/api';

describe('TransactionHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);

  let fixture: ComponentFixture<TransactionHome>;
  let selector: IElementSelector;
  let mockTransactionStore: MockSignalStore<typeof TransactionStore>;
  let mockDispatcher: Dispatcher;
  let mockRouter: MockService<Router>;
  let mockActivatedRoute: ActivatedRoute;
  let queryParamMap: BehaviorSubject<ParamMap>;

  const accountId = testDataFactory.account.id();

  const getLoadMoreButton = () => selector.getElementByTestId<HTMLButtonElement>('load-more');

  const listEvent = (pageNumber: number, pageSize: number, listedAccountId: Api.Account.Id = accountId) => {
    return transactionApiEvents.listTransactionsByAccountInitiated({
      accountId: listedAccountId,
      pageNumber,
      pageSize,
    });
  };

  const changePage = async (page: number) => {
    queryParamMap.next(convertToParamMap({
      page: `${page}`,
    }));
    await fixture.whenStable();
  };

  const render = async (params?: {
    accountId?: Api.Account.Id;
    queryParams?: Params;
  }) => {
    TestBed.resetTestingModule();

    mockRouter = createMockService('navigate');
    queryParamMap = new BehaviorSubject(convertToParamMap(params?.queryParams ?? {}));
    mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({
          accountId: params?.accountId ?? accountId,
        }),
        get queryParams() {
          return queryParamMap.value.keys.reduce((accumulator, key) => ({
            ...accumulator,
            [key]: queryParamMap.value.get(key),
          }), {});
        },
      },
      queryParamMap,
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [TransactionHome],
      providers: [
        provideMockSignalStore(TransactionStore, 'transactionList'),
        provideMockDispatcher(),
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute,
        },
        {
          provide: Router,
          useValue: mockRouter.service,
        },
      ],
    })
      .overrideComponent(TransactionHome, {
        remove: {
          imports: [Toolbar], 
        },
        add: {
          imports: [ToolbarStub], 
        },
      })
      .compileComponents();

    mockTransactionStore = TestBed.inject<MockSignalStore<typeof TransactionStore>>(TransactionStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockTransactionStore.transactionList.set([]);

    fixture = TestBed.createComponent(TransactionHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should list the first 25 items of the account in the url if there is no page in the url', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, listEvent(1, 25), {
        scope: 'self',
      });
    });

    it('should use the account id of the url', async () => {
      const otherAccountId = testDataFactory.account.id();

      await render({
        accountId: otherAccountId,
      });

      validateFunctionCall(mockDispatcher.dispatch, listEvent(1, 25, otherAccountId), {
        scope: 'self',
      });
    });

    it('should list everything up to the page in the url', async () => {
      await render({
        queryParams: {
          page: '3',
        },
      });

      validateFunctionCall(mockDispatcher.dispatch, listEvent(1, 75), {
        scope: 'self',
      });
    });

    it('should handle an invalid page in the url as the first page', async () => {
      await render({
        queryParams: {
          page: 'abc',
        },
      });

      validateFunctionCall(mockDispatcher.dispatch, listEvent(1, 25), {
        scope: 'self',
      });
    });
  });

  describe('if the page in the url changes', () => {
    it('should list only the new page when the page is increased', async () => {
      await render();

      await changePage(2);

      expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(2);
      expect(mockDispatcher.dispatch).toHaveBeenNthCalledWith(2, listEvent(2, 25), {
        scope: 'self',
      });
    });

    it('should list only the new page when the page is increased after loading with a page in the url', async () => {
      await render({
        queryParams: {
          page: '3',
        },
      });

      await changePage(4);

      expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(2);
      expect(mockDispatcher.dispatch).toHaveBeenNthCalledWith(2, listEvent(4, 25), {
        scope: 'self',
      });
    });

    it('should not list anything if the page is decreased, as it is already listed', async () => {
      await render({
        queryParams: {
          page: '3',
        },
      });

      await changePage(2);

      expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    });

    it('should not list anything if the page stays the same', async () => {
      await render({
        queryParams: {
          page: '2',
        },
      });

      await changePage(2);

      expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('load more button', () => {
    it('should increase the page in the url by one if clicked', async () => {
      await render();

      getLoadMoreButton().nativeElement.click();

      validateFunctionCall(mockRouter.functions.navigate, [], {
        relativeTo: mockActivatedRoute,
        queryParams: {
          page: 2,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('should increase the page of the url if it is not the first one', async () => {
      await render({
        queryParams: {
          page: '3',
        },
      });

      getLoadMoreButton().nativeElement.click();

      validateFunctionCall(mockRouter.functions.navigate, [], {
        relativeTo: mockActivatedRoute,
        queryParams: {
          page: 4,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent(ToolbarStub).componentInstance.title()).toBe('Tranzakciók');
    });
  });
});
