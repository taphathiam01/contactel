document.addEventListener('deviceready', onDeviceReady, false);

// Variable globale pour stocker tous les contacts
var allContacts = [];

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
            navigator.notification.alert(
                'Fonction d\'édition à implémenter', 
                function() {}, 
                'Edition', 
                'OK'
            );
        }
    });
    
    // Initialisation de la recherche
    initSearch();
}

function onAppResume() {
    console.log('Application revenue au premier plan - vérification des contacts...');
    loadContacts();
}

function loadContacts() {
    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var fields = ["displayName", "name", "phoneNumbers", "emails", "organizations"];

    navigator.contacts.find(fields, onSuccess, onError, options);
}

function onSuccess(contacts) {
    allContacts = contacts; 
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
    
    // Rafraîchir la listview jQuery Mobile
    $('#contactList').listview('refresh');
    
    $(document).on("pagebeforeshow", "#detailContactPage", function() {
        var contactIndex = $(this).data("contactIndex");
        if (contactIndex !== undefined && allContacts[contactIndex]) {
            showContactDetails(allContacts[contactIndex]);
        }
    });
}

function onError(contactError) {
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '<li class="loading">Erreur : ' + contactError + 
        '<br>Vérifiez que vous avez autorisé l\'accès aux contacts</li>';
    console.error('Erreur lors du chargement des contacts', contactError);
}

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

// Fonction pour ouvrir la page d'ajout de contact
function ajoutercontact() {
    $.mobile.changePage("#addContactPage");
}

// Gestion de la soumission du formulaire d'ajout
$(document).on('submit', '#addContactForm', function(e) {
    e.preventDefault();
    
    var contact = navigator.contacts.create();
    
    var name = new ContactName();
    name.givenName = $('#firstName').val();
    name.familyName = $('#lastName').val();
    contact.name = name;
    
    var phoneNumbers = [];
    if ($('#phoneNumber').val()) {
        phoneNumbers[0] = new ContactField('mobile', $('#phoneNumber').val(), true);
        contact.phoneNumbers = phoneNumbers;
    }
    
    var emails = [];
    if ($('#email').val()) {
        emails[0] = new ContactField('email', $('#email').val(), true);
        contact.emails = emails;
    }
    
    var organizations = [];
    if ($('#organization').val()) {
        organizations[0] = new ContactOrganization();
        organizations[0].name = $('#organization').val();
        organizations[0].title = $('#title').val();
        contact.organizations = organizations;
    }
    
    contact.save(
        function() {
            navigator.notification.alert(
                'Contact ajouté avec succès!',
                function() {
                    // Réinitialiser le formulaire
                    $('#addContactForm')[0].reset();
                    // Recharger les contacts
                    loadContacts();
                    // Retour à la liste
                    $.mobile.changePage("#listcontactPage");
                },
                'Succès',
                'OK'
            );
        },
        function(error) {
            navigator.notification.alert(
                'Erreur lors de l\'ajout du contact: ' + error,
                function() {},
                'Erreur',
                'OK'
            );
        }
    );
});

// Initialisation de la fonction de recherche
function initSearch() {
    $('#contactList').on('filterablebeforefilter', function(e, data) {
        var $ul = $(this),
            $input = $(data.input),
            value = $input.val(),
            html = '';
        
        if (value && value.length > 0) {
            $ul.html('<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>');
            $ul.listview('refresh');
            
            // Filtrer les contacts
            var filteredContacts = allContacts.filter(function(contact) {
                var contactName = getContactName(contact).toLowerCase();
                var phoneNumber = (contact.phoneNumbers && contact.phoneNumbers.length > 0) 
                    ? contact.phoneNumbers[0].value 
                    : '';
                return contactName.includes(value.toLowerCase()) || 
                       phoneNumber.includes(value);
            });
            
            // Afficher les résultats filtrés
            showContacts(filteredContacts);
        } else {
            // Si le champ de recherche est vide, afficher tous les contacts
            showContacts(allContacts);
        }
    });
}