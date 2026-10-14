/** Product catalogue as published by Sauce Demo. Used as the oracle for listing and pricing checks. */
export const products = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const;

export type Product = (typeof products)[keyof typeof products];

export const allProducts: readonly Product[] = Object.values(products);

/** Values of the `<select>` that sorts the inventory. */
export enum SortOption {
  NameAsc = 'az',
  NameDesc = 'za',
  PriceAsc = 'lohi',
  PriceDesc = 'hilo',
}

/** Sales tax applied by the checkout overview page. */
export const TAX_RATE = 0.08;
