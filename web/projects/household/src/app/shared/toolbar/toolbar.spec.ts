import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toolbar } from './toolbar';
import { AuthStore, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, ProgressStore, provideMockSignalStore } from '@household/shared-ui';
import { MainMenu } from '@household/app/shared/main-menu/main-menu';
import { MatProgressBar } from '@angular/material/progress-bar';

describe('Toolbar', () => {
  const MainMenuStub = createStubComponent(MainMenu);
  let fixture: ComponentFixture<Toolbar>;
  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let mockProgressStore: MockSignalStore<typeof ProgressStore>;
  let selector: IElementSelector;

  const getMainMenu = () => {
    return selector.getComponent(MainMenuStub);
  };

  const getProgressBar = () => {
    return selector.getComponent(MatProgressBar);
  };

  const render = async (params?: {
    isLoggedIn?: boolean;
    isInProgress?: boolean;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [Toolbar],
      providers: [
        provideMockSignalStore(AuthStore, 'isLoggedIn'),
        provideMockSignalStore(ProgressStore, 'isInProgress'),
      ],
    }).overrideComponent(Toolbar, {
      remove: {
        imports: [MainMenu],
      },
      add: {
        imports: [MainMenuStub],
      },
    })
      .compileComponents();
      
    mockAuthStore = TestBed.inject<MockSignalStore<typeof AuthStore>>(AuthStore);
    mockProgressStore = TestBed.inject<MockSignalStore<typeof ProgressStore>>(ProgressStore);

    mockAuthStore.isLoggedIn.set(params?.isLoggedIn ?? true);
    mockProgressStore.isInProgress.set(params?.isInProgress ?? false);
    fixture = TestBed.createComponent(Toolbar);

    fixture.componentRef.setInput('title', 'Toolbar title');

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('title', () => {
    it('should be rendered', async () => {
      await render();

      const titleElement = selector.getComponentByTestId('title');

      expect(titleElement.nativeElement.textContent).toContain('Toolbar title');
    });
  });

  describe('main menu', () => {
    it('should be rendered if logged in', async () => {
      await render();

      expect(getMainMenu()).toBeTruthy();
    });

    it('should not be rendered if not logged in', async () => {
      await render({
        isLoggedIn: false,
      });

      expect(getMainMenu()).toBeFalsy();
    });
  });

  describe('progress bar', () => {
    it('should be rendered if there is an ongoing progress', async () => {
      await render({
        isInProgress: true,
      });

      expect(getProgressBar()).toBeTruthy();
    });

    it('should not be rendered if there is no progress', async () => {
      await render();

      expect(getProgressBar()).toBeFalsy();
    });
  });

});
