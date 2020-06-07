import { ObjectType } from "../defintion/types/ObjectType";
import { InterfaceType } from "../defintion/types/InterfaceType";
import { InputType } from "../defintion/types/InputType";

export abstract class Type {
  getObjectType(): ObjectType {
    return undefined;
  }

  getInterfaceType(): InterfaceType {
    return undefined;
  }

  getInputType(): InputType {
    return undefined;
  }
}
