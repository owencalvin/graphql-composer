import { KeyValue } from "../../shared/KeyValue";
import { GQLType } from "../defintion/types/GQLType";

export class TypeResolver {
  static resolve(obj: KeyValue, types: GQLType[]) {
    const points: number[] = [];
    const keys = Object.keys(obj);

    types.find((type, index) => {
      points.push(0);
      const includesCount = type.fields.filter((f) => keys.includes(f.name))
        .length;
      if (includesCount) {
        points[index] = includesCount;
      }
    });

    return types[points.indexOf(Math.max(...points))].built;
  }
}
