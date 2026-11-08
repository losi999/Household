import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconButton } from '@angular/material/button';
import { provideRouter } from '@angular/router';
import { authEvents, elementSelectorFactory, IElementSelector, provideMockDispatcher } from '@household/shared-ui';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MainMenu } from './main-menu';

describe('MainMenu', () => {
  let fixture: ComponentFixture<MainMenu>;
  let selector: IElementSelector;
  let mockDispatcher: Dispatcher;

  const getTrigger = () => {
    return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton);
  };

  const getMenuItems = () => {
    return Array.from(document.querySelectorAll<HTMLElement>('[mat-menu-item]'));
  };

  const getMenuItem = (label: string) => {
    return getMenuItems().find(i => i.textContent.trim() === label);
  };

  const render = async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [MainMenu],
      providers: [
        provideRouter([]),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockDispatcher = TestBed.inject(Dispatcher);

    fixture = TestBed.createComponent(MainMenu);
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  const openMenu = async () => {
    getTrigger().nativeElement.click();

    await fixture.whenStable();
  };

  describe('trigger button', () => {
    it('should render the menu icon', async () => {
      await render();

      expect(getTrigger().nativeElement.textContent.trim()).toBe('menu');
    });
  });

  describe('menu', () => {
    it('should not be open initially', async () => {
      await render();

      expect(getMenuItems()).toHaveLength(0);
    });

    it('should list the entries in order after opening', async () => {
      await render();
      await openMenu();

      expect(getMenuItems().map(i => i.textContent.trim())).toEqual([
        'Naptár',
        'Vendégek',
        'Árlista',
        'Bevétel',
        'Kijelentkezés',
      ]);
    });

    it.each([
      [
        'Naptár',
        '/',
      ],
      [
        'Vendégek',
        '/customers',
      ],
      [
        'Árlista',
        '/prices',
      ],
      [
        'Bevétel',
        '/income',
      ],
    ])('should link %s to %s', async (label, href) => {
      await render();
      await openMenu();

      expect(getMenuItem(label).getAttribute('href')).toBe(href);
    });
  });

  describe('log out entry', () => {
    it('should dispatch logOut if clicked', async () => {
      await render();
      await openMenu();

      getMenuItem('Kijelentkezés').click();

      validateFunctionCall(mockDispatcher.dispatch, authEvents.logOut(), {
        scope: 'self',
      });
    });

    it('should not dispatch anything before it is clicked', async () => {
      await render();
      await openMenu();

      validateFunctionCall(mockDispatcher.dispatch);
    });
  });
});
