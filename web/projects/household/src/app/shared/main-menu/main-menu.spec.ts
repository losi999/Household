import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainMenu } from './main-menu';
import { AuthStore, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Dispatcher } from '@ngrx/signals/events';
import { provideRouter } from '@angular/router';
import { UserType } from '@household/shared/enums';
import { MatMenuItem } from '@angular/material/menu';

describe('MainMenu', () => {
  let fixture: ComponentFixture<MainMenu>;
  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let selector: IElementSelector;
  let mockDispatcher: Dispatcher;

  const getMenuButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('menu');
  };

  const getHomeButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('home');
  };

  const getCatalogButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('catalog');
  };

  const getImportsButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('imports');
  };

  const getSettingsButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('settings');
  };  

  const getProjectsButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('projects');
  };

  const getCategoriesButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('categories');
  };

  const getProductsButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('products');
  };

  const getRecipientsButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('recipients');
  };

  const getLogoutButton = () => {
    return selector.getComponentByTestId<MatMenuItem>('log-out');
  };

  const render = async (userTypes: UserType[] = []) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [MainMenu],
      providers: [
        provideMockSignalStore(AuthStore, 'userTypes'),
        provideMockDispatcher(),
        provideRouter([]),
      ],
    })
      .compileComponents();

    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockAuthStore.userTypes.set(userTypes);

    fixture = TestBed.createComponent(MainMenu);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('logout', () => {
    it ('should be rendered', async () => {
      await render();

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getLogoutButton()).toBeTruthy();
    });

    it('on click should dispatch logOut', async () => {
      await render();

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      getLogoutButton().nativeElement.click();

      expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('home', () => {
    it ('should be rendered', async () => {
      await render();

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getHomeButton()).toBeTruthy();      
    });
  });

  describe('catalog', () => {
    it ('should be rendered for editors', async () => {
      await render([UserType.Editor]);

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getCatalogButton()).toBeTruthy();      
    });

    it ('should not be rendered non-editors', async () => {
      await render();

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getCatalogButton()).toBeFalsy();      
    });
  });

  describe('import', () => {
    it ('should be rendered for editors', async () => {
      await render([UserType.Editor]);

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getImportsButton()).toBeTruthy();      
    });

    it ('should not be rendered non-editors', async () => {
      await render();

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getImportsButton()).toBeFalsy();      
    });
  });

  describe('settings', () => {
    it ('should be rendered', async () => {
      await render();

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      expect(getSettingsButton()).toBeTruthy();      
    });
  });

  describe('projects', () => {
    it ('should be rendered for editors', async () => {
      await render([UserType.Editor]);

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      getCatalogButton().nativeElement.click();

      await fixture.whenStable();

      expect(getProjectsButton()).toBeTruthy();      
    });
  });

  describe('categories', () => {
    it ('should be rendered for editors', async () => {
      await render([UserType.Editor]);

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      getCatalogButton().nativeElement.click();

      await fixture.whenStable();

      expect(getCategoriesButton()).toBeTruthy();      
    });
  });

  describe('products', () => {
    it ('should be rendered for editors', async () => {
      await render([UserType.Editor]);

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      getCatalogButton().nativeElement.click();

      await fixture.whenStable();

      expect(getProductsButton()).toBeTruthy();      
    });
  });

  describe('recipients', () => {
    it ('should be rendered for editors', async () => {
      await render([UserType.Editor]);

      getMenuButton().nativeElement.click();

      await fixture.whenStable();

      getCatalogButton().nativeElement.click();

      await fixture.whenStable();

      expect(getRecipientsButton()).toBeTruthy();      
    });
  });
});
