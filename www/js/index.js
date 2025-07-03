document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova est prêt, chargement des contacts...');
    loadContacts();
    
    // Écouter l'événement de retour à l'application
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
    var fields = ["*"];

    navigator.contacts.find(fields, onSuccess, onError, options);
}
function loadContacts() {
    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var fields = ["*"];

    navigator.contacts.find(fields, onSuccess, onError, options);
}

function onSuccess(contacts) {
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';

    if (contacts.length === 0) {
        contactsList.innerHTML = '<div class="loading">Aucun contact trouvé</div>';
        return;
    }

    // Trier les contacts par nom
    contacts.sort(function (a, b) {
        var nameA = getContactName(a).toUpperCase();
        var nameB = getContactName(b).toUpperCase();
        return nameA.localeCompare(nameB);
    });

    // Afficher les contacts
    contacts.forEach(function (contact) {
        var contactDiv = document.createElement('div');
        contactDiv.className = 'contact-item';

        var name = getContactName(contact);
        contactDiv.innerHTML = '<div class="contact-name">' + name + '</div>';

        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            contact.phoneNumbers.forEach(function (phone) {
                contactDiv.innerHTML += '<div class="contact-phone">' + phone.value + '</div>';
            });
        } else {
            contactDiv.innerHTML += '<div class="contact-phone">Aucun numéro</div>';
        }

        contactsList.appendChild(contactDiv);
    });
}

function onError(contactError) {
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '<div class="loading">Erreur : ' + contactError + 
        '<br>Vérifiez que vous avez autorisé l\'accès aux contacts</div>';
    console.error('Erreur lors du chargement des contacts', contactError);
}

// 🔧 Fonction utilitaire pour obtenir un nom propre
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
