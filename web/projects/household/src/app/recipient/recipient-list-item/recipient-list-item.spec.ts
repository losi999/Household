import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientListItem } from './recipient-list-item';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { recipientEvents } from '@household/state/recipient/recipient-events';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemTitle } from '@angular/material/list';
import { Api } from '@household/shared/types/api';

describe('RecipientListItem', () => {
  let fixture: ComponentFixture<RecipientListItem>;
  let selector: IElementSelector;
  let mockRecipientStore: MockSignalStore<typeof RecipientStore>;
  let mockDispatcher: Dispatcher;

  const recipient = testDataFactory.recipient.response();

  const render = async (isInProgress: Api.Recipient.Id[] = []) => {
    mockRecipientStore.isInProgress.set(isInProgress);

    fixture = TestBed.createComponent(RecipientListItem);
    fixture.componentRef.setInput('recipient', recipient);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientListItem],
      providers: [
        provideMockSignalStore(RecipientStore, 'isInProgress'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockRecipientStore = TestBed.inject<MockSignalStore<typeof RecipientStore>>(RecipientStore);
    mockDispatcher = TestBed.inject(Dispatcher);
  });

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if recipient is not in progress', async () => {
      await render([testDataFactory.recipient.id()]);

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if recipient is in progress', async () => {
      await render([recipient.recipientId]);

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should dispatch openRecipientListItemSubmenu', async () => {
        await render();

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, recipientEvents.openRecipientListItemSubmenu(recipient), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if disabled', async () => {
        await render([recipient.recipientId]);

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(recipient.name);
    });
  });
});
