// Navigation Tests - Student Grades
describe('Navigation - Student Grades', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the homepage successfully', () => {
    cy.get('.navbar').should('be.visible');
    cy.get('.nav-brand').should('contain', 'Student Grades');
  });

  it('shows the dashboard page by default', () => {
    cy.get('#page-dashboard').should('not.have.class', 'hidden');
    cy.get('.page-title').should('contain', 'Dashboard');
  });

  it('displays stat cards on dashboard', () => {
    cy.get('.stats-grid').should('be.visible');
    cy.get('.stat-card').should('have.length', 3);
  });

  it('shows total count stat on dashboard', () => {
    cy.get('#stat-total').should('be.visible');
    cy.get('#stat-total').invoke('text').then(parseInt).should('be.gte', 0);
  });

  it('navigates to students list page', () => {
    cy.get('.nav-link[data-page="students"]').click();
    cy.get('#page-students').should('not.have.class', 'hidden');
  });

  it('navigates to add new item page', () => {
    cy.get('.nav-link[data-page="add"]').click();
    cy.get('#page-add').should('not.have.class', 'hidden');
  });

  it('shows the item form when navigating to add page', () => {
    cy.get('.nav-link[data-page="add"]').click();
    cy.get('#item-form').should('be.visible');
  });

  it('shows cancel button on add page', () => {
    cy.get('.nav-link[data-page="add"]').click();
    cy.get('#btn-cancel').should('be.visible');
  });

  it('cancel button returns to students list', () => {
    cy.get('.nav-link[data-page="add"]').click();
    cy.get('#btn-cancel').click();
    cy.get('#page-students').should('not.have.class', 'hidden');
  });

  it('shows add new button on students list page', () => {
    cy.get('.nav-link[data-page="students"]').click();
    cy.get('#btn-add-new').should('be.visible');
  });

  it('btn-add-new navigates to add page', () => {
    cy.get('.nav-link[data-page="students"]').click();
    cy.get('#btn-add-new').click();
    cy.get('#page-add').should('not.have.class', 'hidden');
  });

  it('nav links have correct text', () => {
    cy.get('.nav-links').should('be.visible');
    cy.get('.nav-link').should('have.length.gte', 2);
  });

  it('api health endpoint returns ok status', () => {
    cy.request('/api/health').its('body.status').should('eq', 'ok');
  });

  it('api health endpoint returns correct project name', () => {
    cy.request('/api/health').its('body.project').should('eq', 'Student Grades');
  });
});
