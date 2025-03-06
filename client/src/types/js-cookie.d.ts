declare module 'js-cookie' {
  interface CookieAttributes {
    path?: string;
    domain?: string;
    expires?: number | Date;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  }

  interface CookiesStatic {
    set(name: string, value: string, options?: CookieAttributes): string;
    get(name: string): string | undefined;
    remove(name: string, options?: CookieAttributes): void;
    getJSON(name: string): any;
    withAttributes(attributes: CookieAttributes): CookiesStatic;
    withConverter(converter: {
      read: (value: string) => string;
      write: (value: string) => string;
    }): CookiesStatic;
    noConflict(): CookiesStatic;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}
