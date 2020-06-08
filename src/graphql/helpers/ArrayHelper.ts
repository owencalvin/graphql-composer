export type Named = { name?: string };
export type Findable<T extends Named> = T | string | number;
export type Removable<T extends Named> = Findable<T>[];

export class ArrayHelper {
  static remove<T extends Named = any>(
    itemOrIndexOrName: Removable<T>,
    array: T[],
  ): T[] {
    const arrayCopy = [...array];

    const indexes = itemOrIndexOrName
      .reduce((prev, rm) => {
        const index = ArrayHelper.find(rm, arrayCopy);
        if (index) {
          prev.push(index.index);
        }
        return prev;
      }, [])
      .sort();

    while (indexes.length) {
      arrayCopy.splice(indexes.pop(), 1);
    }

    return arrayCopy;
  }

  static find<T extends Named = any>(
    itemOrIndexOrName: Named | string | number,
    array: T[],
  ): { index: number; ref: T } | undefined {
    let index: number;

    switch (typeof itemOrIndexOrName) {
      case "number":
        index = itemOrIndexOrName as number;
        break;
      case "string":
        index = array.findIndex((item) => item.name === itemOrIndexOrName);
        break;
      default:
        index = array.indexOf(itemOrIndexOrName as T);
        break;
    }

    if (index > -1) {
      return { index, ref: array[index] };
    }
  }

  static set<T extends Named = any>(
    itemOrIndexOrName: Findable<T>,
    value: T,
    array: T[],
  ): T[] {
    const arrayCopy = [...array];
    const found = ArrayHelper.find(itemOrIndexOrName, array);
    if (found) {
      arrayCopy[found.index] = value;
    }
    return arrayCopy;
  }

  static addWithoutDuplication<T extends Named = any>(
    name: Named,
    value: T,
    array: T[],
  ): T[] {
    const arrayCopy = [...array];
    const found = ArrayHelper.find(name, array);
    if (!found) {
      arrayCopy.push(value);
    }
    return arrayCopy;
  }
}
