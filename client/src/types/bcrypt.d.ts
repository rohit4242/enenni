declare module "bcrypt" {
  function hash(password: string, salt: number): Promise<string>;
  function compare(password: string, hash: string): Promise<boolean>;
}
