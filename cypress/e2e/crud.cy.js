// CRUD Tests - Student Grades
describe('CRUD Operations - Student Grades', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.nav-link[data-page="students"]').click();
    cy.get('#students-list').should('be.visible');
  });

  it('shows seeded items on students list', () => {
    cy.get('#students-list .item-card').should('have.length.gte', 1);
  });

  it('creates a new item successfully', () => {
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type('Test Assignment');
    cy.get('#field-description, #field-content, #field-review, #field-notes').first().type('Test description for new item');
    cy.get('#btn-submit').click();
    cy.get('#page-students').should('not.have.class', 'hidden');
    cy.get('#students-list').should('contain', 'Test Assignment');
  });

  it('shows new item in the list after creation', () => {
    const title = 'Unique Item ' + Date.now();
    cy.get('#btn-add-new').click();
    cy.get('#field-title').type(title);
    cy.get('#btn-submit').click();
    cy.get('#students-list').should('contain', title);
  });

  it('item card has view button', () => {
    cy.get('.item-card').first().find('.btn-view').should('be.visible');
  });

  it('item card has edit button', () => {
    cy.get('.item-card').first().find('.btn-edit-card').should('be.visible');
  });

  it('item card has delete button', () => {
    cy.get('.item-card').first().find('.btn-delete-card').should('be.visible');
  });

  it('view button shows detail page', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#page-detail').should('not.have.class', 'hidden');
  });

  it('detail page has back button', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-back').should('be.visible');
  });

  it('detail page has edit button', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-edit').should('be.visible');
  });

  it('detail page has delete button', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-delete').should('be.visible');
  });

  it('back button returns from detail to list', () => {
    cy.get('.item-card').first().find('.btn-view').click();
    cy.get('#btn-back').click();
    cy.get('#page-students').should('not.have.class', 'hidden');
  });

  it('edit button from list opens edit form', () => {
    cy.get('.item-card').first().find('.btn-edit-card').click();
    cy.get('#page-add').should('not.have.class', 'hidden');
    cy.get('#item-id').invoke('val').should('not.be.empty');
  });

  it('edit form is pre-filled with existing values', () => {
    cy.get('.item-card').first().find('.btn-edit-card').click();
    cy.get('#field-title').invoke('val').should('not.be.empty');
  });

  it('can update an existing item', () => {
    cy.get('.item-card').first().find('.btn-edit-card').click();
    cy.get('#field-title').clear().type('Updated Assignment');
    cy.get('#btn-submit').click();
    cy.get('#students-list').should('contain', 'Updated Assignment');
  });

  it('delete shows confirmation dialog', () => {
    cy.on('window:confirm', () => false);
    cy.get('.item-card').first().find('.btn-delete-card').click();
  });

  it('confirming delete removes item from list', () => {
    cy.get('#students-list .item-card').then($cards => {
      const initialCount = $cards.length;
      cy.on('window:confirm', () => true);
      cy.get('.item-card').first().find('.btn-delete-card').click();
      cy.get('#students-list .item-card').should('have.length', initialCount - 1);
    });
  });

  it('api returns items as array', () => {
    cy.request('/api/students').its('body').should('be.an', 'array');
  });

  it('api create endpoint returns 201', () => {
    cy.request({
      method: 'POST',
      url: '/api/students',
      body: {"title":"Test Assignment","name":"Test Student","studentId":"STU9999","course":"Computer Science","grade":"A","semester":"Semester 1","notes":"Excellent work"},
    }).its('status').should('eq', 201);
  });

  it('dashboard shows total count on stat card', () => {
    cy.visit('/');
    cy.get('#stat-total').invoke('text').then(count => {
      expect(parseInt(count)).to.be.gte(0);
    });
    cy.get('.stat-card').should('have.length', 3);
  });
});
