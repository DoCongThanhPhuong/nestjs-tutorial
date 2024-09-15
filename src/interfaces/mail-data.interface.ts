export interface IMailData<T = never> {
  to: string | string[];
  data: T;
}
