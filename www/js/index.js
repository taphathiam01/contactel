document.addEventListener('deviceready', loadContacts);

function loadContacts() {
    let options = new ContactFindOptions();
    options.multiple = true;
    options.hasPhoneNumber = true;
    let fields = ['*']; 

    navigator.contacts.find(fields, showContacts, onError, options);
}

function showContacts(contacts) {
    let contactsHTML = '';
    for (const contact of contacts) {
        contactsHTML += 
        <li>
            <img src="img/logo.png" alt="logo" />
            <h2>${contact.displayName}</h2>
            <p>${contact.phoneNumbers[0].value}(${contact.phoneNumbers[0].type})</p>
        </li>
}
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = contactsHTML;
    $(contactList).listview('refresh');
}

function onError(contactError) {
    alert('Error while fetching contacts!');
    console.error(contactError);
}
