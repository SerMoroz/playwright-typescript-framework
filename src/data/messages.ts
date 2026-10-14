/** User-facing messages asserted by the tests, kept in one place so copy changes are a one-line fix. */
export const messages = {
  login: {
    lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
    invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
    usernameRequired: 'Epic sadface: Username is required',
    passwordRequired: 'Epic sadface: Password is required',
    protectedPage: (path: string) =>
      `Epic sadface: You can only access '${path}' when you are logged in.`,
  },
  checkout: {
    firstNameRequired: 'Error: First Name is required',
    lastNameRequired: 'Error: Last Name is required',
    postalCodeRequired: 'Error: Postal Code is required',
    orderComplete: 'Thank you for your order!',
  },
} as const;
