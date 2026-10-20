export {};

declare global {
  interface Window {
    cashboxAuth?: {
      nonce: string;
      userId: number;
      graphqlUrl: string;
      restUrl: string;
    };
  }
}
