export type Removable<T> = (T | string | number)[];

export class ArrayHelper {
  static remove<T>(itemOrIndexOrName: Removable<T>, array: T[]): T[] {
    let indexes: number[] = [];

    itemOrIndexOrName.map((rm) => {
      let index: number;

      switch (typeof rm) {
        case "number":
          index = rm as number;
          break;
        case "string":
          index = (array as any).findIndex((item) => item.name === rm);
          break;
        default:
          index = array.indexOf(rm as T);
          break;
      }

      if (index > -1) {
        indexes.push(index);
      }
    });

    indexes = indexes.sort();

    while (indexes.length) {
      array.splice(indexes.pop(), 1);
    }

    return array;
  }
}
