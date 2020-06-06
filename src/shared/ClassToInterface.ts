export type ClassToInterface<T, ReturnType> = {
  [P in keyof T]?: ReturnType;
};
