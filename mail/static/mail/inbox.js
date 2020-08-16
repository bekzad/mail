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
  document.querySelector('#email-id').style.display = 'none';
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
  document.querySelector('#email-id').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  emailsView = document.querySelector('#emails-view');
  emailsView.innerHTML = '';

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Create the whole bootsrap container
    const container = document.createElement('div');
    container.className = 'container-fluid p-0';

    // Loop over each email
    emails.forEach(email => {

      // Create a div for each row
      const row = document.createElement('a');
      row.className = 'row no-gutters';
      row.setAttribute('href',"#");
      row.setAttribute('onClick',"return false;");
      
      // If view is sent then show recipients rather than sender
      if (mailbox === 'sent') {
        row.innerHTML = `<div class="col-4">${email.recipients}</div><div class="col-5">${email.subject}</div><div class="col-3">${email.timestamp}</div>`;
      }
      else {
        // Make background grey if the email is read
        if (email.read) {
          row.style.backgroundColor = 'rgba(242,245,245,0.8)';
        }

        row.innerHTML = `<div class="col-4">${email.sender}</div><div class="col-5">${email.subject}</div><div class="col-3">${email.timestamp}</div>`;
      }

      row.addEventListener('click', function () {
        show_email(email.id);
        archive_button(mailbox, email.id);
        reply(email);
      });

      // Append the row to a container and to DOM
      container.append(row);
      emailsView.append(container);

    });
  });
}

function show_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-id').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    const sender = document.querySelector('#sender');
    const recipients = document.querySelector('#recipients');
    const subject = document.querySelector('#subject');
    const timestamp = document.querySelector('#timestamp');
    const body = document.querySelector('#body');

    sender.innerHTML = email.sender;
    recipients.innerHTML = email.recipients;
    subject.innerHTML = email.subject;
    timestamp.innerHTML = email.timestamp;
    body.innerHTML = email.body;
  });
  
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}
function archive_button(mailbox, id) {
  const archiveButton = document.querySelector('#archiveButton');
  if (mailbox === 'inbox') {
    archiveButton.style.display = 'inline-block';
    archiveButton.innerHTML = 'Archive';
    archiveButton.addEventListener('click', function () {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      location.reload();
    });
  }
  else if (mailbox === 'archive') {
    archiveButton.style.display = 'inline-block';
    archiveButton.innerHTML = 'Unarchive';
    archiveButton.addEventListener('click', function () {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      location.reload();
    });
  }
  else {
    archiveButton.style.display = 'none';
  }
}

function reply(email) {

  document.querySelector('#replyButton').onclick = function() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-id').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Fill out composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    
    // Add Re for subject
    const subject = email.subject;
    if (subject.substr(0, 3) === 'Re:') {
      document.querySelector('#compose-subject').value = email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    
    // Add the characters to a body
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:${email.body}\n\t`;
  }
    
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
