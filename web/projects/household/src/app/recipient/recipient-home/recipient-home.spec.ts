import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientHome } from './recipient-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@household/app/shared/toolbar/toolbar';
import { RecipientList } from '@household/app/recipient/recipient-list/recipient-list';
import { RecipientStore } from '@household/state/recipient/recipient-store';
import { recipientApiEvents, recipientEvents } from '@household/state/recipient/recipient-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';

describe('RecipientHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const RecipientListStub = createStubComponent(RecipientList);

  let fixture: ComponentFixture<RecipientHome>;
  let selector: IElementSelector;
  let mockRecipientStore: MockSignalStore<typeof RecipientStore>;
  let mockDispatcher: Dispatcher;

  const recipients = [
    testDataFactory.recipient.response(),
    testDataFactory.recipient.response(),
  ];

  const render = async (recipientList: Responses.Recipient[] = recipients) => {
    mockRecipientStore.recipientList.set(recipientList);

    fixture = TestBed.createComponent(RecipientHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientHome],
      providers: [
        provideMockSignalStore(RecipientStore, 'recipientList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(RecipientHome, {
        remove: {
          imports: [
            Toolbar,
            RecipientList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            RecipientListStub,
          ],
        },
      })
      .compileComponents();

    mockRecipientStore = TestBed.inject<MockSignalStore<typeof RecipientStore>>(RecipientStore);
    mockDispatcher = TestBed.inject(Dispatcher);
  });

  describe('on init', () => {
    it('should dispatch listRecipientsInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, recipientApiEvents.listRecipientsInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Partnerek');
    });
  });

  describe('create button', () => {
    const getElement = () => {
      return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
    };

    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('add');
    });

    it('should dispatch createRecipient if clicked', async () => {
      await render();

      getElement().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, recipientEvents.createRecipient(), {
        scope: 'self',
      });
    });
  });

  describe('recipient list', () => {
    it('should be rendered with the recipients of the store', async () => {
      await render();

      expect(selector.getComponent<RecipientList>(RecipientListStub).componentInstance.recipients()).toEqual(recipients);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(selector.getComponent<RecipientList>(RecipientListStub).componentInstance.recipients()).toEqual([]);
    });
  });
});
