import { PaginatePipe } from './paginate-pipe';

describe('PaginatePipe', () => {
  const pipe = new PaginatePipe();
  const items = [
    1,
    2,
    3,
    4,
    5,
  ];

  it.each([
    [
      0,
      [
        1,
        2,
      ],
    ],
    [
      1,
      [
        3,
        4,
      ],
    ],
    [
      2,
      [5],
    ],
    [
      3,
      [],
    ],
  ])('should return the items of page %s', (pageIndex, pageItems) => {
    expect(pipe.transform(items, pageIndex, 2)).toEqual(pageItems);
  });

  it('should not change the original list', () => {
    pipe.transform(items, 0, 2);

    expect(items).toHaveLength(5);
  });
});
