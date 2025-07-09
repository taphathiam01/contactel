document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova est prêt, chargement des contacts...');
    loadContacts();
    document.addEventListener('resume', onAppResume, false);
}

function onAppResume() {
    console.log('Application revenue au premier plan - vérification des contacts...');
    loadContacts();
}

function loadContacts() {
    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var fields = ["displayName", "name", "phoneNumbers"];

    navigator.contacts.find(fields, onSuccess, onError, options);
}

function onSuccess(contacts) {
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';

    if (contacts.length === 0) {
        contactsList.innerHTML = '<li class="loading">Aucun contact trouvé</li>';
        return;
    }

    // Trier les contacts par nom
    contacts.sort(function(a, b) {
        var nameA = getContactName(a).toUpperCase();
        var nameB = getContactName(b).toUpperCase();
        return nameA.localeCompare(nameB);
    });

    showContacts(contacts);
}

function showContacts(contacts) {
    var contactsList = document.getElementById('contacts-list');
    
    contacts.forEach(function(contact) {
        var contactName = getContactName(contact);
        var phoneNumber = (contact.phoneNumbers && contact.phoneNumbers.length > 0) 
            ? contact.phoneNumbers[0].value 
            : 'Aucun numéro';
        
        var contactItem = document.createElement('li');
        contactItem.innerHTML = `
            <a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r">
                <img src="img/pngegg.png"  alt="logo" />
                <h2>${contactName}</h2>
                <p>${phoneNumber}</p>
            </a>
        `;
        
        contactsList.appendChild(contactItem);
    });
}

function onError(contactError) {
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '<li class="loading">Erreur : ' + contactError + 
        '<br>Vérifiez que vous avez autorisé l\'accès aux contacts</li>';
    console.error('Erreur lors du chargement des contacts', contactError);
}

// nom propre du contact
function getContactName(contact) {
    if (contact.displayName && contact.displayName.trim() !== '') {
        return contact.displayName;
    } else if (contact.name) {
        var given = contact.name.givenName || "";
        var family = contact.name.familyName || "";
        var fullName = (given + " " + family).trim();
        return fullName !== "" ? fullName : "Nom inconnu";
    } else {
        return "Nom inconnu";
    }
}

// stocker les contacts
var allContacts = [];

function onSuccess(contacts) {
    allContacts = contacts; 
    
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';

    if (contacts.length === 0) {
        contactsList.innerHTML = '<li class="loading">Aucun contact trouvé</li>';
        return;
    }

    contacts.sort(function(a, b) {
        var nameA = getContactName(a).toUpperCase();
        var nameB = getContactName(b).toUpperCase();
        return nameA.localeCompare(nameB);
    });

    showContacts(contacts);
}

function showContacts(contacts) {
    var contactsList = document.getElementById('contacts-list');
    
    contacts.forEach(function(contact, index) {
        var contactName = getContactName(contact);
        var phoneNumber = (contact.phoneNumbers && contact.phoneNumbers.length > 0) 
            ? contact.phoneNumbers[0].value 
            : 'Aucun numéro';
        
        var contactItem = document.createElement('li');
        contactItem.innerHTML = `
            <a href="#detailContactPage" class="ui-btn ui-btn-icon-right ui-icon-carat-r" data-contact-index="${index}">
                <img class="avatar" src="img/pngegg.png" alt="logo" />
                <h2>${contactName}</h2>
                <p>${phoneNumber}</p>
            </a>
        `;
        
        contactsList.appendChild(contactItem);
    });
    
    $(document).on("pagebeforeshow", "#detailContactPage", function() {
        var contactIndex = $(this).data("contactIndex");
        if (contactIndex !== undefined && allContacts[contactIndex]) {
            showContactDetails(allContacts[contactIndex]);
        }
    });
}

//fonction pour afficher les détails d'un contact
function showContactDetails(contact) {
    var contactDetailsList = document.getElementById('contactDetailsList');
    contactDetailsList.innerHTML = '';
    
    var contactName = getContactName(contact);
    var phoneNumbers = contact.phoneNumbers || [];
    var emails = contact.emails || [];
    var organizations = contact.organizations || [];
    var title = contact.title || 'Pas de titre';
    var photoItem = document.createElement('li');
    photoItem.innerHTML = `
        <img src="img/pngegg.png" alt="Avatar de ${contactName}">
        <h2>${contactName}</h2>
        <p>${title}</p>
        
    `;
    contactDetailsList.appendChild(photoItem);
    
    // Numéros de téléphone
    if (phoneNumbers.length > 0) {
        phoneNumbers.forEach(function(phone) {
            var phoneItem = document.createElement('li');
            phoneItem.innerHTML = `
                <h2>Téléphone (${phone.type})</h2>
                <p>${phone.value}</p>
            `;
            contactDetailsList.appendChild(phoneItem);
        });
    } else {
        var noPhoneItem = document.createElement('li');
        noPhoneItem.innerHTML = `<h2>Téléphone</h2><p>Aucun numéro</p>`;
        contactDetailsList.appendChild(noPhoneItem);
    }
    
    // Emails
    if (emails.length > 0) {
        emails.forEach(function(email) {
            var emailItem = document.createElement('li');
            emailItem.innerHTML = `
                <h2>Email (${email.type})</h2>
                <p>${email.value}</p>
            `;
            contactDetailsList.appendChild(emailItem);
        });
    } else {
        var noEmailItem = document.createElement('li');
        noEmailItem.innerHTML = `<h2>Email</h2><p>Aucun email</p>`;
        contactDetailsList.appendChild(noEmailItem);
    }
    
    // Organisations
    if (organizations.length > 0) {
        organizations.forEach(function(org) {
            var orgItem = document.createElement('li');
            orgItem.innerHTML = `
                <h2>Organisation</h2>
                <p>${org.name || 'Inconnu'}</p>
            `;
            contactDetailsList.appendChild(orgItem);
        });
    } else {
        var noOrgItem = document.createElement('li');
        noOrgItem.innerHTML = `<h2>Organisation</h2><p>Aucune organisation</p>`;
        contactDetailsList.appendChild(noOrgItem);
    }
    
    // Rafraîchir la listview jQuery Mobile
    $(contactDetailsList).listview('refresh');
}

function onDeviceReady() {
    console.log('Cordova est prêt, chargement des contacts...');
    loadContacts();
    
    document.addEventListener('resume', onAppResume, false);
    
    // Gestion du clic sur un contact
    $(document).on('click', '[data-contact-index]', function(e) {
        var contactIndex = $(this).attr('data-contact-index');
        $('#detailContactPage').data('contactIndex', contactIndex);
    });
    
    // Bouton d'édition
    $('#editContactBtn').click(function() {
        var contactIndex = $('#detailContactPage').data('contactIndex');
        if (contactIndex !== undefined && allContacts[contactIndex]) {
            // Aimplémenter la fonction d'édition (plus tard)
            navigator.notification.alert(
                'Fonction d\'édition à implémenter', 
                function() {}, 
                'Edition', 
                'OK'
            );
        }
    });
}