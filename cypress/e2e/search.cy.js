// Search and Filter Tests - Student Grades
// NOTE: Tests marked [FLAKY-INJECTED] are deliberately unstable
// for MSc dissertation research on AI-assisted flaky test detection.

describe('Search and Filter - Student Grades', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3007/api/reset');
    cy.visit('/');
    cy.get('.nav-link[data-page="students"]').click();
  });

  it('search input is visible', () => {
    cy.get('#search-input').should('be.visible');
  });

  it('category filter is visible', () => {
    cy.get('#filter-category').should('be.visible');
  });

  // [FLAKY-INJECTED] timing: search results may not render before assertion
  it('searching for existing item title shows result', () => {
    // Flakiness: intermittent delay before search results load
    cy.wait(Math.random() < 0.35 ? 5000 : 200);
    cy.get('#students-list .item-card').first().find('.item-title').invoke('text').then(title => {
      const searchTerm = title.slice(0, 5);
      cy.get('#search-input').clear().type(searchTerm);
      cy.get('#students-list .item-card').should('have.length.gte', 1);
    });
  });

  it('searching for non-existent term shows empty state', () => {
    cy.get('#search-input').type('xyzabc123nonexistent');
    cy.get('#students-list').should('contain', 'No items found');
  });

  it('clearing search restores full list', () => {
    cy.get('#students-list .item-card').then($cards => {
      const total = $cards.length;
      cy.get('#search-input').type('xyznonexistent');
      cy.get('#search-input').clear();
      cy.get('#students-list .item-card').should('have.length', total);
    });
  });

  it('category filter shows all categories option', () => {
    cy.get('#filter-category option').first().should('contain', 'All Categories');
  });

  // [FLAKY-INJECTED] backend: slow response causes filter to appear empty
  it('filter by first category works', () => {
    cy.get('#filter-category').find('option').eq(1).invoke('val').then(val => {
      cy.get('#filter-category').select(val);
      // Flakiness: backend delay means filtered results not ready when checked
      cy.wait(Math.random() < 0.35 ? 5500 : 200);
      cy.get('#students-list').should('be.visible');
    });
  });

  it('filter by All Categories shows all items', () => {
    cy.get('#filter-category').find('option').eq(1).invoke('val').then(val => {
      cy.get('#filter-category').select(val);
      cy.get('#filter-category').select('');
      cy.get('#students-list .item-card').should('have.length.gte', 1);
    });
  });

  it('api search endpoint filters results', () => {
    cy.request('/api/students?search=test').its('body').should('be.an', 'array');
  });

  it('api category filter endpoint works', () => {
    cy.request('/api/students?category=General').its('body').should('be.an', 'array');
  });

  it('search is case-insensitive', () => {
    cy.get('#students-list .item-card').first().find('.item-title').invoke('text').then(title => {
      cy.get('#search-input').clear().type(title.toUpperCase().slice(0, 4));
      cy.get('#students-list .item-card').should('have.length.gte', 1);
    });
  });

  it('combined search and filter works', () => {
    cy.get('#search-input').type('a');
    cy.get('#filter-category').find('option').eq(1).invoke('val').then(val => {
      cy.get('#filter-category').select(val);
      cy.get('#students-list').should('be.visible');
    });
  });

  it('resetting filters shows full list', () => {
    cy.get('#search-input').type('test');
    cy.get('#filter-category').find('option').eq(1).invoke('val').then(val => {
      cy.get('#filter-category').select(val);
      cy.get('#search-input').clear();
      cy.get('#filter-category').select('');
      cy.get('#students-list .item-card').should('have.length.gte', 1);
    });
  });

  it('api returns all items when no filter applied', () => {
    cy.request('/api/students').its('body').should('have.length.gte', 1);
  });

  it('recent items section visible on dashboard', () => {
    cy.get('.nav-link[data-page="dashboard"]').click();
    cy.get('.recent-section').should('be.visible');
    cy.get('#recent-list').should('be.visible');
  });
});
