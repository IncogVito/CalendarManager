import {trimNestedArray} from "../../helper/array.util";

test('Should trim nested array after 1 index', () => {
    // given
    const nestedArray = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

    // when
    const trimmedArray = trimNestedArray(nestedArray, 1, 1);

    // then
    expect(trimmedArray.length).toBe(2);
    expect(trimmedArray[0].length).toBe(2);
    expect(trimmedArray[1].length).toBe(3);
});

test('Should trim nested array after 3 index', () => {
    // given
    const nestedArray = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

    // when
    const trimmedArray = trimNestedArray(nestedArray, 0, 3);

    // then
    expect(trimmedArray.length).toBe(2);
    expect(trimmedArray[0].length).toBe(3);
    expect(trimmedArray[1].length).toBe(3);
});