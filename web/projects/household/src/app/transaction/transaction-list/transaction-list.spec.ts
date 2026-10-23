import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatList } from '@angular/material/list';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { TransactionListItem } from '@household/app/transaction/transaction-list-item/transaction-list-item';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Responses } from '@household/shared/types/responses';
import { TransactionList } from './transaction-list';

describe('TransactionList', () => {
  const TransactionListItemStub = createStubComponent(TransactionListItem);

  let fixture: ComponentFixture<TransactionList>;
  let selector: IElementSelector;

  const transactions: Responses.Transaction[] = [
    testDataFactory.transaction.response.payment(),
    testDataFactory.transaction.response.transfer(),
    testDataFactory.transaction.response.split(),
  ];

  const render = async (transactionList: Responses.Transaction[] = transactions) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TransactionList],
    })
      .overrideComponent(TransactionList, {
        remove: {
          imports: [TransactionListItem],
        },
        add: {
          imports: [TransactionListItemStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TransactionList);
    fixture.componentRef.setInput('transactions', transactionList);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatList)).toBeTruthy();
    });
  });

  describe('list items', () => {
    it('should be rendered for each transaction in the given order', async () => {
      await render();

      const listItems = selector.listComponents<TransactionListItem>(TransactionListItemStub, MatList);

      expect(listItems.length).toBe(transactions.length);
      listItems.forEach((listItem, index) => {
        expect(listItem.componentInstance.transaction()).toEqual(transactions[index]);
      });
    });

    it('should not be rendered if there are no transactions', async () => {
      await render([]);

      expect(selector.listComponents(TransactionListItemStub, MatList).length).toBe(0);
    });
  });
});
