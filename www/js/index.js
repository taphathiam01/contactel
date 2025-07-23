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
    
    const contact = {
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

    navigator.contacts.create(contact).save(
        () => {
            $('#addContactForm').trigger("reset");
            loadContacts();
            $.mobile.changePage("#listcontactPage");
        },
        (error) => {
            console.error(`Erreur lors de l'ajout du contact: ${error}`);
        }
    );
});

// Modifier la fonction editContact pour utiliser la page d'ajout
function editContact(contactIndex) {
    if (contactIndex !== undefined && allContacts[contactIndex]) {
        var contact = allContacts[contactIndex];
        
        // Remplir le formulaire avec les données du contact
        $('#firstName').val(contact.name ? contact.name.givenName || '' : '');
        $('#lastName').val(contact.name ? contact.name.familyName || '' : '');
        $('#phoneNumber').val(contact.phoneNumbers && contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].value : '');
        $('#email').val(contact.emails && contact.emails.length > 0 ? contact.emails[0].value : '');
        $('#organization').val(contact.organizations && contact.organizations.length > 0 ? contact.organizations[0].name : '');
        $('#title').val(contact.organizations && contact.organizations.length > 0 ? contact.organizations[0].title : '');
        
        // Stocker l'index du contact en cours de modification
        $('#addContactPage').data({
            'contactIndex': contactIndex,
            'isEditMode': true
        });
        
        // Changer le titre de la page
        $('#addContactPage h1').text('Modifier contact');
        
        // Aller à la page d'ajout/modification
        $.mobile.changePage("#addContactPage");
    }
}

// Modifier le gestionnaire de soumission du formulaire
$(document).on('submit', '#addContactForm', function(e) {
    e.preventDefault();
    
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

    if (isEditMode && contactIndex !== undefined && allContacts[contactIndex]) {
        // Mode édition - mettre à jour le contact existant
        var contact = allContacts[contactIndex];
        
        // Mettre à jour les propriétés du contact
        contact.name = contactData.name;
        contact.phoneNumbers = contactData.phoneNumbers;
        contact.emails = contactData.emails;
        contact.organizations = contactData.organizations;
        
        // Sauvegarder les modifications
        contact.save(
            function() {
                $('#addContactForm').trigger("reset");
                loadContacts();
                $.mobile.changePage("#listcontactPage");
                
                // Réinitialiser les données de la page
                $('#addContactPage').removeData('contactIndex').removeData('isEditMode');
                $('#addContactPage h1').text('Nouveau contact');
            },
            function(error) {
                console.error(`Erreur lors de la modification du contact: ${error}`);
                navigator.notification.alert(
                    'Erreur lors de la modification du contact', 
                    function() {}, 
                    'Erreur', 
                    'OK'
                );
            }
        );
    } else {
        // Mode ajout - créer un nouveau contact
        navigator.contacts.create(contactData).save(
            function() {
                $('#addContactForm').trigger("reset");
                loadContacts();
                $.mobile.changePage("#listcontactPage");
            },
            function(error) {
                console.error(`Erreur lors de l'ajout du contact: ${error}`);
                navigator.notification.alert(
                    'Erreur lors de l\'ajout du contact', 
                    function() {}, 
                    'Erreur', 
                    'OK'
                );
            }
        );
    }
});

// Mettre à jour la fonction ajoutercontact pour s'assurer qu'on est en mode ajout
function ajoutercontact() {
    // Réinitialiser le formulaire
    $('#addContactForm').trigger("reset");
    
    // S'assurer qu'on est en mode ajout
    $('#addContactPage').removeData('contactIndex').removeData('isEditMode');
    $('#addContactPage h1').text('Nouveau contact');
    
    $.mobile.changePage("#addContactPage");
}

// Mettre à jour les gestionnaires d'événements pour la page de détails
$(document).on("pagebeforeshow", "#detailContactPage", function() {
    var contactIndex = $(this).data("contactIndex");
    if (contactIndex !== undefined && allContacts[contactIndex]) {
        showContactDetails(allContacts[contactIndex]);
        
        // Mettre à jour les boutons d'édition et de suppression
        $('#editContactBtn').off('click').click(function() {
            editContact(contactIndex);
        });
        
        $('#deleteContactBtn').off('click').click(function() {
            deleteContact(contactIndex);
        });
    }
});

// Fonction pour supprimer un contact
function deleteContact(contactIndex) {
    if (contactIndex === undefined || !allContacts[contactIndex]) {
        console.error("Index de contact invalide");
        return;
    }

    var contact = allContacts[contactIndex];
    console.log("Tentative de suppression du contact:", contact.id, contact.displayName);

    // Vérification spécifique iOS
    if (!contact.remove) {
        console.warn("La méthode remove n'est pas disponible, utilisation de l'approche alternative");
        deleteContactIOS(contactIndex);
        return;
    }

    navigator.notification.confirm(
        `Voulez-vous vraiment supprimer ${getContactName(contact)} ?`,
        function(buttonIndex) {
            if (buttonIndex !== 2) return; // Annulé

            // Première tentative avec l'API standard
            contact.remove(
                function() {
                    handleDeleteSuccess(contactIndex);
                },
                function(error) {
                    console.error("Échec méthode standard, tentative alternative:", error);
                    deleteContactIOS(contactIndex);
                }
            );
        },
        'Confirmation',
        ['Annuler', 'Supprimer']
    );
}

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