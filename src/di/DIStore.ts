import { ClassType } from "../shared/ClassType";

export class DIStore {
  private _instances: Map<any, InstanceType<ClassType<any>>> = new Map();

  createInstance<Type>(
    classType: ClassType<Type>,
    id?: any,
  ): InstanceType<ClassType<Type>> {
    const instance = new classType();
    this._instances.set(id || instance, instance);

    return instance;
  }

  getInstance<Type>(idOrInstance: any | Type): Type {
    return this._instances.get(idOrInstance);
  }
}
