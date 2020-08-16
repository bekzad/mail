document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
  // Functionality for when the email is sent (form submitted)
  document.querySelector('#compose-form').onsubmit = function (evt) {

    // First compose the email and send it to an API
    compose(evt);

    // Then redirect to send view after some time, because it will redirect before the function above finishes
    setTimeout(function () {
      if (localStorage.getItem('error') === 'no') {
        load_mailbox('sent');
      }  
    }, 2000);
  };
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

  // Hide the alert 
  document.querySelector('#composeAlert').style.display = 'none';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-id').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Select the Email View
  emailsView = document.querySelector('#emails-view');

  // Fetch all the inbox, sent or archived emails of the user
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
        // Make background of all sent emails grey
        row.style.backgroundColor = 'rgba(242,245,245,0.8)';
        // Add values for each email
        row.innerHTML = `<div class="col-4">${email.recipients}</div><div class="col-5">${email.subject}</div><div class="col-3">${email.timestamp}</div>`;
      }
      else {
        // Make background grey if the email is read
        if (email.read) {
          row.style.backgroundColor = 'rgba(242,245,245,0.8)';
        }
        // Add values for each email
        row.innerHTML = `<div class="col-4">${email.sender}</div><div class="col-5">${email.subject}</div><div class="col-3">${email.timestamp}</div>`;
      }

      // Add clickable functions for each row
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

  // Show only email view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-id').style.display = 'block';

  // Fetch from the API all the field values of the email and put the values into the DOM
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
  
  // Change the value of read into true to make the background of an email grey in inbox view
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive_button(mailbox, id) {

  // Get the archive button from the DOM
  const archiveButton = document.querySelector('#archiveButton');

  // In inbox view display archive button
  if (mailbox === 'inbox') {
    archiveButton.style.display = 'inline-block';
    archiveButton.innerHTML = 'Archive';

    // When the archive button clicked change the value of archived field of the email to true
    archiveButton.addEventListener('click', function () {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })

      // When the archive button clicked show an archive alert 
      document.querySelector('#archiveAlert').style.display = 'block';
      document.querySelector('#archiveAlert').innerHTML = 'Archived';

      // Start animation and reload the page after 1 second of showing archive alert
      setTimeout(function () {
        archiveButton.parentElement.style.animationPlayState = 'running';
        archiveButton.parentElement.addEventListener('animationend', () => {
          location.reload();
        });
      }, 1000);
    });
  }

  // In archive view display unarchive button
  else if (mailbox === 'archive') {
    archiveButton.style.display = 'inline-block';
    archiveButton.innerHTML = 'Unarchive';

    // When the unarchive button clicked change the value of archived field of the email to false
    archiveButton.addEventListener('click', function () {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })

      // When the unnarchive button clicked show an unarchive alert 
      document.querySelector('#archiveAlert').style.display = 'block';
      document.querySelector('#archiveAlert').innerHTML = 'Unarchived';

      // Start animation and reload the page after 1 second of showing unarchive alert
      setTimeout(function () {
        archiveButton.parentElement.style.animationPlayState = 'running';
        archiveButton.parentElement.addEventListener('animationend', () => {
          location.reload();
        });
      }, 1000);
    });
  }

  // In sent view don't show archive button
  else {
    archiveButton.style.display = 'none';
  }
}

function reply(email) {

  // Select the reply button from the DOM
  document.querySelector('#replyButton').onclick = function() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-id').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Hide the compose alert 
    document.querySelector('#composeAlert').style.display = 'none';
  
    // Fill out compose fields, first email of a recipient
    document.querySelector('#compose-recipients').value = email.sender;
    
    // Add Re for subject and the subject itself
    const subject = email.subject;
    if (subject.substr(0, 3) === 'Re:') {
      document.querySelector('#compose-subject').value = email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    
    // Add the old email's body values with the name and timestamp
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:${email.body}\n\t`;
  }  
}

function compose(evt) {
  // Function sends the email

  // Don't submit the form
  evt.preventDefault();

  // Get values from form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send the email to an API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })

  // Show appropriate alerts if the email has been sent successfully or we got an error from the API
  .then(response => response.json())
  .then(result => {

    // Select the alert from the DOM
    const composeAlert = document.querySelector('#composeAlert');   

    // If there has been an error create an error alert
    if (result.error) {
      composeAlert.className = 'alert alert-danger';
      composeAlert.innerHTML = result.error;
      localStorage.setItem('error', 'yes');
    }

    // If it was sent successfully create a success alert
    else {
      composeAlert.className = 'alert alert-success';
      composeAlert.innerHTML = result.message;
      localStorage.setItem('error', 'no');
    }

    // Show the alert
    composeAlert.style.display = 'block';
  })

  // Don't submit the form
  return false;
}