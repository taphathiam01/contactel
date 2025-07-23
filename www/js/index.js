document.addEventListener('deviceready', onDeviceReady, false);

var allContacts = [];

function onDeviceReady() {
    console.log('Cordova est prêt, chargement des contacts...');
    loadContacts();
    
    document.addEventListener('resume', onAppResume, false);
    
    $(document).on('click', '[data-contact-index]', function(e) {
        var contactIndex = $(this).attr('data-contact-index');
        $('#detailContactPage').data('contactIndex', contactIndex);
    });
    
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

    navigator.contacts.find(fields, onContactsLoaded, onContactsError, options);
}

function onContactsLoaded(contacts) {
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

    displayContacts(contacts);
}

function displayContacts(contacts) {
    var contactsList = $('#contacts-list').empty();
    
    contacts.forEach(function(contact, index) {
        var contactName = getContactName(contact);
        var phoneNumber = contact.phoneNumbers?.[0]?.value || 'Aucun numéro';
        
        contactsList.append(`
            <li>
                <a href="#detailContactPage" class="ui-btn ui-btn-icon-right ui-icon-carat-r" data-contact-index="${index}">
                    <img class="avatar" src="img/pngegg.png" alt="logo" />
                    <h2>${contactName}</h2>
                    <p>${phoneNumber}</p>
                </a>
            </li>
        `);
    });
    
    $('#contactList').listview('refresh');
}

function onContactsError(contactError) {
    var contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '<li class="loading">Erreur : ' + contactError + 
        '<br>Vérifiez que vous avez autorisé l\'accès aux contacts</li>';
    console.error('Erreur lors du chargement des contacts', contactError);
}

function getContactName(contact) {
    if (contact.displayName && contact.displayName.trim() !== '') {
        return contact.displayName;
    }
    
    if (contact.name) {
        var given = contact.name.givenName || "";
        var family = contact.name.familyName || "";
        return (given + " " + family).trim() || "Nom inconnu";
    }
    
    return "Nom inconnu";
}

function showContactDetails(contact) {
    var contactDetailsList = $('#contactDetailsList').empty();
    var contactName = getContactName(contact);
    
    contactDetailsList.append(`
        <li>
            <img src="img/pngegg.png" alt="Avatar de ${contactName}">
            <h2>${contactName}</h2>
            <p>${contact.title || 'Pas de titre'}</p>
        </li>
    `);
    
    if (contact.phoneNumbers?.length > 0) {
        contact.phoneNumbers.forEach(function(phone) {
            contactDetailsList.append(`
                <li>
                    <h2>Téléphone (${phone.type})</h2>
                    <p>${phone.value}</p>
                </li>
            `);
        });
    } else {
        contactDetailsList.append('<li><h2>Téléphone</h2><p>Aucun numéro</p></li>');
    }
    
    if (contact.emails?.length > 0) {
        contact.emails.forEach(function(email) {
            contactDetailsList.append(`
                <li>
                    <h2>Email (${email.type})</h2>
                    <p>${email.value}</p>
                </li>
            `);
        });
    } else {
        contactDetailsList.append('<li><h2>Email</h2><p>Aucun email</p></li>');
    }
    
    if (contact.organizations?.length > 0) {
        contact.organizations.forEach(function(org) {
            contactDetailsList.append(`
                <li>
                    <h2>Organisation</h2>
                    <p>${org.name || 'Inconnu'}</p>
                </li>
            `);
        });
    } else {
        contactDetailsList.append('<li><h2>Organisation</h2><p>Aucune organisation</p></li>');
    }
    
    contactDetailsList.listview('refresh');
}

$(document).off('submit', '#addContactForm').on('submit', '#addContactForm', function(e) {
    e.preventDefault();
    
    var $submitButton = $(this).find('[type="submit"]');
    $submitButton.prop('disabled', true);
    
    var isEditMode = $('#addContactPage').data('isEditMode');
    var contactIndex = $('#addContactPage').data('contactIndex');
    
    const contactData = {
        name: {
            givenName: $('#firstName').val(),
            familyName: $('#lastName').val()
        },
        phoneNumbers: $('#phoneNumber').val() ? [{type: 'mobile', value: $('#phoneNumber').val(), pref: true}] : [],
        emails: $('#email').val() ? [{type: 'email', value: $('#email').val(), pref: true}] : [],
        organizations: $('#organization').val() ? [{
            name: $('#organization').val(),
            title: $('#title').val()
        }] : []
    };

    function handleSuccess() {
        $submitButton.prop('disabled', false);
        $('#addContactForm').trigger("reset");
        loadContacts();
        $.mobile.changePage("#listcontactPage");
        $('#addContactPage').removeData('contactIndex').removeData('isEditMode');
        $('#addContactPage h1').text('Nouveau contact');
    }

    function handleError(error) {
        $submitButton.prop('disabled', false);
        console.error(`Erreur: ${error}`);
        navigator.notification.alert(
            'Erreur lors de l\'opération', 
            function() {}, 
            'Erreur', 
            'OK'
        );
    }

    if (isEditMode && contactIndex !== undefined && allContacts[contactIndex]) {
        var contact = allContacts[contactIndex];
        contact.name = contactData.name;
        contact.phoneNumbers = contactData.phoneNumbers;
        contact.emails = contactData.emails;
        contact.organizations = contactData.organizations;
        
        contact.save(handleSuccess, handleError);
    } else {
        navigator.contacts.create(contactData).save(handleSuccess, handleError);
    }
});

function editContact(contactIndex) {
    if (contactIndex === undefined || !allContacts[contactIndex]) return;
    
    var contact = allContacts[contactIndex];
    
    $('#firstName').val(contact.name?.givenName || '');
    $('#lastName').val(contact.name?.familyName || '');
    $('#phoneNumber').val(contact.phoneNumbers?.[0]?.value || '');
    $('#email').val(contact.emails?.[0]?.value || '');
    $('#organization').val(contact.organizations?.[0]?.name || '');
    $('#title').val(contact.organizations?.[0]?.title || '');
    
    $('#addContactPage')
        .data('contactIndex', contactIndex)
        .data('isEditMode', true)
        .find('h1').text('Modifier contact');
    
    $.mobile.changePage("#addContactPage");
}

function ajoutercontact() {
    $('#addContactForm').trigger("reset");
    $('#addContactPage')
        .removeData('contactIndex')
        .removeData('isEditMode')
        .find('h1').text('Nouveau contact');
    
    $.mobile.changePage("#addContactPage");
}

$(document).on("pagebeforeshow", "#detailContactPage", function() {
    var contactIndex = $(this).data("contactIndex");
    if (contactIndex !== undefined && allContacts[contactIndex]) {
        showContactDetails(allContacts[contactIndex]);
        
        $('#editContactBtn').off('click').click(function() {
            editContact(contactIndex);
        });
        
        $('#deleteContactBtn').off('click').click(function() {
            deleteContact(contactIndex);
        });
    }
});

function deleteContact(contactIndex) {
    if (!allContacts[contactIndex]) return;
    
    var contactName = getContactName(allContacts[contactIndex]);
    
    navigator.notification.confirm(
        `Voulez-vous supprimer ${contactName} ?`,
        function(buttonIndex) {
            if (buttonIndex === 2) { 
                allContacts[contactIndex].remove(
                    function() {
                        allContacts.splice(contactIndex, 1);
                        displayContacts(allContacts);
                        $.mobile.changePage("#listcontactPage");
                    },
                    function(error) {
                        navigator.notification.alert(
                            'Échec de la suppression: ' + error, 
                            function() {}, 
                            'Erreur', 
                            'OK'
                        );
                    }
                );
            }
        },
        'Confirmation',
        ['Annuler', 'Supprimer']
    );
}

function initSearch() {
    $('#contactList').on('filterablebeforefilter', function(e, data) {
        var $ul = $(this),
            value = $(data.input).val();
        
        if (value && value.length > 0) {
            $ul.html('<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>')
               .listview('refresh');
            
            var filteredContacts = allContacts.filter(function(contact) {
                var contactName = getContactName(contact).toLowerCase();
                var phoneNumber = contact.phoneNumbers?.[0]?.value || '';
                return contactName.includes(value.toLowerCase()) || 
                       phoneNumber.includes(value);
            });
            
            displayContacts(filteredContacts);
        } else {
            displayContacts(allContacts);
        }
    });
}