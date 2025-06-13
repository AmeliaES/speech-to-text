describe('Basic recording flow', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5000/');
  });

  it('buttons are present and either enabled or disabled as expected', () => {
    cy.get('#record').should('not.be.disabled');
    cy.get('#stop').should('be.disabled');
    cy.get('#transcribe').should('be.disabled');
  });

  it('records audio and enables the stop button', () => {
    cy.get('#record').click();
    cy.get('#record').should('be.disabled');
    cy.get('#stop').should('not.be.disabled');
  });

  it('stops recording and enables the transcribe button', () => {
    cy.get('#record').click();
    cy.get('#stop').click();
    cy.get('#record').should('not.be.disabled');
    cy.get('#stop').should('be.disabled');
    cy.get('#transcribe').should('not.be.disabled');
  });

  it('simulates transcribe button with sample.webm blob', () => {
    // Read fixture file as base64 string
    cy.fixture('sample.webm', 'base64').then((base64) => {
      // Convert base64 string to Blob with correct MIME type
      const audioBlob = Cypress.Blob.base64StringToBlob(base64, 'audio/webm');

      // Construct FormData and append the Blob as "audio" file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'sample.webm');

      // Use native fetch inside Cypress to send FormData (since cy.request does not support FormData easily)
      cy.window()
        .then((win) => {
          return win.fetch('/transcribe', {
            method: 'POST',
            body: formData,
          });
        })
        .then((response) => {
          expect(response.status).to.eq(200);
          return response.json();
        })
        .then((data) => {
          expect(data).to.have.property('text');
          cy.log('Transcribed text:', data.text);
          cy.get('#transcript').invoke('text', data.text);
          cy.get('#transcript').should('not.be.empty');
        });
    });
  });
});
