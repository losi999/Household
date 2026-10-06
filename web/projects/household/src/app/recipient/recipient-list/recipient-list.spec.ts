import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientList } from './recipient-list';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { RecipientListItem } from '@household/app/recipient/recipient-list-item/recipient-list-item';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { MatActionList } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';

describe('RecipientList', () => {
  const RecipientListItemStub = createStubComponent(RecipientListItem);

  let fixture: ComponentFixture<RecipientList>;
  let selector: IElementSelector;

  const recipients = [
    testDataFactory.recipient.response(),
    testDataFactory.recipient.response(),
  ];

  const render = async (recipientList: Responses.Recipient[]) => {
    fixture = TestBed.createComponent(RecipientList);
    fixture.componentRef.setInput('recipients', recipientList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientList],
    })
      .overrideComponent(RecipientList, {
        remove: {
          imports: [RecipientListItem],
        },
        add: {
          imports: [RecipientListItemStub],
        },
      })
      .compileComponents();
  });

  describe('action list', () => {
    it('should be rendered', async () => {
      await render(recipients);

      expect(selector.getComponent(MatActionList)).toBeTruthy();
    });
  });

  describe('list items', () => {
    it('should be rendered for each recipient', async () => {
      await render(recipients);

      const listItems = selector.listComponents<RecipientListItem>(RecipientListItemStub, MatActionList);

      expect(listItems.length).toBe(recipients.length);
      listItems.forEach((listItem, index) => {
        expect(listItem.componentInstance.recipient()).toEqual(recipients[index]);
      });
    });

    it('should not be rendered if there are no recipients', async () => {
      await render([]);

      expect(selector.listComponents(RecipientListItemStub, MatActionList).length).toBe(0);
    });
  });
});
