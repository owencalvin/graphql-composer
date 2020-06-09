import { ClassType, ClassToInterface } from "..";

export type PossibleType =
  | string
  | number
  | symbol
  | Object
  | Boolean
  | BigInt
  | Function
  | PossibleType[];

export interface Description {
  property: string;
  type: PossibleType;
}

export class ClassDescriptor {
  static describe<T extends ClassType<any>, DescriptionValue>(
    classType: T,
    description: ClassToInterface<T>,
  );
  static describe<T extends ClassType<any>>(classType: T);
  static describe<T extends ClassType<any>>(
    classType: T,
    description?: ClassToInterface<T>,
  ) {
    if (!description) {
      const instance = new classType();
      const properties = Object.keys(instance);
      return properties.map<Description>((property) => {
        return {
          property,
          type: ClassDescriptor.convertTypeOfToType(instance[property]),
        };
      });
    } else {
      return Object.keys(description).map<Description>((key) => {
        return {
          property: key,
          type: description[key],
        };
      });
    }
  }

  static convertTypeOfToType(item: any): PossibleType {
    if (Array.isArray(item)) {
      return [this.convertTypeOfToType(item[0])];
    }

    const typeMap = {
      string: String,
      number: Number,
      boolean: Boolean,
      function: Function,
      object: Object,
      symbol: Symbol,
      bigint: BigInt,
    };

    return typeMap[typeof item];
  }

  static instanceOf<T>(item: T, ...possibleIntances: Function[]) {
    return possibleIntances.some((i) => {
      return item instanceof i;
    });
  }

  static doExtends<TClassType extends ClassType>(
    classType: TClassType,
    extension: Function,
  ) {
    try {
      const instance = new classType();
      return instance instanceof extension;
    } catch (err) {}
    return false;
  }
}
