
Cypress.Commands.add('resetDB', () => {
  cy.request('POST', 'http://localhost:3007/api/reset');
});

Cypress.Commands.add('getItems', () => {
  return cy.request('GET', 'http://localhost:3007/api/students').its('body');
});
