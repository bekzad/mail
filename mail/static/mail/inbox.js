document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').onsubmit = compose;
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  emailsView = document.querySelector('#emails-view');

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    // Create the whole bootsrap container
    const container = document.createElement('div');
    container.className = 'container-fluid p-0';

    // Loop over each email
    emails.forEach(email => {

      // Populate the row with data
      if (mailbox === 'sent') {
        email.recipients.forEach(recipient => {

          // Create a div for each row
          const row = document.createElement('div');
          row.className = 'row no-gutters';

          // Make background grey if the email is read
          if (email.read) {
            row.style.backgroundColor = '#f1f1f1';
          }

          row.innerHTML = `<div class="col-4">${recipient}</div><div class="col-5">${email.subject}</div><div class="col-3">${email.timestamp}</div>`;
          // Append the row to a container and to DOM
          container.append(row);
          emailsView.append(container);
        });
      }
      else {

        // Create a div for each row
        const row = document.createElement('div');
        row.className = 'row no-gutters';

        // Make background grey if the email is read
        if (email.read) {
          row.style.backgroundColor = '#f1f1f1';
        }

        row.innerHTML = `<div class="col-4">${email.sender}</div><div class="col-5">${email.subject}</div><div class="col-3">${email.timestamp}</div>`;
        // Append the row to a container and to DOM
        container.append(row);
        emailsView.append(container);
      }


    });
  });
  
}


function compose() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
}
