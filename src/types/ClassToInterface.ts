export type ClassToInterface<T> = {
  [P in keyof T]?: P;
};
