import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MainMenu } from '@hairdressing/app/shared/main-menu/main-menu';
import { AuthStore, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, ProgressStore, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from './toolbar';

describe('Toolbar', () => {
  const MainMenuStub = createStubComponent(MainMenu);

  let fixture: ComponentFixture<Toolbar>;
  let selector: IElementSelector;
  let mockAuthStore: MockSignalStore<typeof AuthStore>;
  let mockProgressStore: MockSignalStore<typeof ProgressStore>;

  const getMainMenu = () => {
    return selector.getComponent(MainMenuStub);
  };

  const getProgressBar = () => {
    return selector.getComponent(MatProgressBar);
  };

  const getTitle = () => {
    return selector.getElementByCss('.wrapper > span:not(.spacer)');
  };

  const render = async (params?: {
    title?: string;
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
    })
      .overrideComponent(Toolbar, {
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
    fixture.componentRef.setInput('title', params?.title ?? 'Title');
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('title', () => {
    it('should be rendered', async () => {
      await render({
        title: 'Naptár',
      });

      expect(getTitle().nativeElement.textContent).toBe('Naptár');
    });
  });

  describe('main menu', () => {
    it('should be rendered if the user is logged in', async () => {
      await render({
        isLoggedIn: true,
      });

      expect(getMainMenu()).toBeTruthy();
    });

    it('should not be rendered if the user is not logged in', async () => {
      await render({
        isLoggedIn: false,
      });

      expect(getMainMenu()).toBeFalsy();
    });

    it('should appear when the user logs in', async () => {
      await render({
        isLoggedIn: false,
      });

      mockAuthStore.isLoggedIn.set(true);
      await fixture.whenStable();

      expect(getMainMenu()).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should be rendered if something is in progress', async () => {
      await render({
        isInProgress: true,
      });

      expect(getProgressBar().componentInstance.mode).toBe('indeterminate');
    });

    it('should not be rendered if nothing is in progress', async () => {
      await render({
        isInProgress: false,
      });

      expect(getProgressBar()).toBeFalsy();
    });

    it('should disappear when the progress ends', async () => {
      await render({
        isInProgress: true,
      });

      mockProgressStore.isInProgress.set(false);
      await fixture.whenStable();

      expect(getProgressBar()).toBeFalsy();
    });
  });
});
