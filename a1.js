// --- Mock Data for Dropdowns (remains the same) ---
const MOCK_DATA = {
    clientAccounts: [
        { value: '', text: 'Select client account' },
        { value: 'acc123', text: 'Account 123 - John Doe' },
        { value: 'acc456', text: 'Account 456 - Jane Smith' }
    ],
    payeeAccounts: [
        { value: '', text: '—' },
        { value: 'payee789', text: 'Payee 789 - Services Inc.' },
        { value: 'payee012', text: 'Payee 012 - Utility Co.' }
    ],
    transactionTypes: [
        { value: '', text: 'Select type' },
        { value: 'cash', text: '1 — Cash' },
        { value: 'transfer', text: '2 — Bank Transfer' },
        { value: 'payment', text: '3 — Bill Payment' }
    ],
    currencies: [
        { value: 'USD', text: 'USD' },
        { value: 'EUR', text: 'EUR' },
        { value: 'GBP', text: 'GBP' }
    ],
    reasonsForDisbursement: [
        { value: 'gift', text: 'Gift' },
        { value: 'payment_service', text: 'Payment for Services' },
        { value: 'personal', text: 'Personal Use' }
    ],
    clientPhoneNumbers: [
        { value: 'phone1', text: 'Home Voice 1 (+XX XXXXX)' },
        { value: 'phone2', text: 'Mobile 1 (+XX XXXXX)' }
    ]
};

// --- Configuration for Form Fields (IDs are direct strings) ---
const formFieldsConfig = [
    { id: 'clientAccount', label: 'Client account', required: true, defaultErrorMessage: 'Client account is required.', optionsKey: 'clientAccounts' },
    { id: 'payeeAccount', label: 'Payee account', required: true, defaultErrorMessage: 'Payee account is required.', optionsKey: 'payeeAccounts' },
    { id: 'transactionTypeSelect', label: 'Type', required: true, defaultErrorMessage: 'Type is required.', defaultValue: 'cash', optionsKey: 'transactionTypes' },
    { id: 'amount', label: 'Amount', required: true, validation: (val) => parseFloat(val) > 0, defaultErrorMessage: 'Amount must be greater than 0.', defaultValue: '0.00' },
    { id: 'currency', label: 'Currency', required: true, defaultErrorMessage: 'Please select the transaction currency.', defaultValue: 'USD', optionsKey: 'currencies' },
    { id: 'datePickerInput', label: 'Date', required: true, defaultErrorMessage: 'Date is required.', isDate: true },
    { id: 'reasonForDisbursement', label: 'Reason for Disbursement', required: true, defaultErrorMessage: 'Please select a reason for disbursement.', defaultValue: 'gift', optionsKey: 'reasonsForDisbursement' },
    { id: 'clientPhoneNumber', optionsKey: 'clientPhoneNumbers' } // Not required, just for population
];

// --- Helper Functions ---

function displayGeneralMessage(message, type = 'info') {
    const $messageDisplayEl = $('#messageDisplay');
    if (!$messageDisplayEl.length) return;
    $messageDisplayEl.text(message)
        .removeClass('message-success message-info message-error')
        .addClass('message-' + type)
        .slideDown();
    setTimeout(() => { $messageDisplayEl.slideUp(); }, 5000);
}

function setFieldError(fieldId, message, showError) {
    const $errorElement = $(`#${fieldId}Error`);
    const $fieldElement = $(`#${fieldId}`);

    if ($errorElement.length) {
        $errorElement.text(message).css('display', showError ? 'block' : 'none');
    }
    if ($fieldElement.length) {
        $fieldElement.prop('aria-invalid', showError);
        if (showError) {
            if ($fieldElement.attr('type') === 'date') $fieldElement.addClass('invalid-field');
        } else {
            if ($fieldElement.attr('type') === 'date') $fieldElement.removeClass('invalid-field');
        }
    }
}

function setCurrentDate() {
    const $datePicker = $('#datePickerInput');
    if (!$datePicker.length) return;
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    $datePicker.val(`${year}-${month}-${day}`);
}

function populateSelectWithOptions(selectId, optionsArray) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) {
        console.warn(`Select element with ID ${selectId} not found for population.`);
        return;
    }
    selectElement.innerHTML = ''; // Clear existing options

    optionsArray.forEach(optionData => {
        const fluentOption = document.createElement('fluent-option');
        fluentOption.setAttribute('value', optionData.value);
        fluentOption.textContent = optionData.text;
        selectElement.appendChild(fluentOption);
    });
}

function prePopulateForm() {

    
    formFieldsConfig.forEach(fieldConfig => {
        const fieldElement = document.getElementById(fieldConfig.id);
        if (!fieldElement) {
            console.warn(`Element with ID ${fieldConfig.id} not found during prePopulateForm.`);
            return;
        }

        if (fieldConfig.optionsKey && MOCK_DATA[fieldConfig.optionsKey]) {
            populateSelectWithOptions(fieldConfig.id, MOCK_DATA[fieldConfig.optionsKey]);
        }

        // Crucially, set the value *after* options are populated.
        if (fieldConfig.defaultValue !== undefined) {
            fieldElement.value = fieldConfig.defaultValue;
        } else if (fieldConfig.optionsKey && MOCK_DATA[fieldConfig.optionsKey] && MOCK_DATA[fieldConfig.optionsKey].length > 0 && MOCK_DATA[fieldConfig.optionsKey][0].value !== undefined) {
            // If no explicit default, and it's a select, set to the value of the first option if it's meaningful (e.g. placeholder)
            // This helps ensure the select component reflects an initial state.
            fieldElement.value = MOCK_DATA[fieldConfig.optionsKey][0].value;
        }
    });
    setCurrentDate();
}

function resetFormAndMessages() {
    const $form = $('#transactionForm');
    if ($form.length) $form[0].reset();

    formFieldsConfig.forEach(config => setFieldError(config.id, '', false));
    $('#confirmCall').prop('aria-invalid', false);

    prePopulateForm();

    $('#internalMemo').val('');
    $('#waiveFee').prop('checked', false);
    $('#confirmCall').prop('checked', false);

    const radioGroup = document.getElementById('transactionNatureGroup');
    if (radioGroup) {
        const firstRadio = radioGroup.querySelector('fluent-radio[value="single"]');
        if (firstRadio) {
            firstRadio.checked = true;
        }
    }

    $('#confirmCallError').hide();
    $('#missingFieldsAlert').hide();
    $('#missingFieldsList').html('<li>Please fill in all mandatory fields correctly.</li>');
    $('#messageDisplay').hide();

    displayGeneralMessage('Form dismissed and reset to defaults.', 'info');
}

function validateForm(errorMessagesArray) {
    let isValid = true;

    formFieldsConfig.forEach(fieldConfig => {
        if (!fieldConfig.required) return;

        const fieldElement = document.getElementById(fieldConfig.id);
        let isFieldInvalid = false;
        let errorMessage = fieldConfig.defaultErrorMessage;

        if (!fieldElement) {
            console.warn(`Validation: Field with ID ${fieldConfig.id} not found.`);
            return;
        }

        const value = fieldElement.value;

        if (value === undefined || value === null || String(value).trim() === '') {
            isFieldInvalid = true;
        } else if (fieldConfig.validation && !fieldConfig.validation(value)) {
            isFieldInvalid = true;
        }

        if (isFieldInvalid) {
            setFieldError(fieldConfig.id, errorMessage, true);
            errorMessagesArray.push(errorMessage);
            isValid = false;
        } else {
            setFieldError(fieldConfig.id, '', false);
        }
    });

    const $confirmCallCheckbox = $('#confirmCall');
    if ($confirmCallCheckbox.length && !$confirmCallCheckbox.prop('checked')) {
        $('#confirmCallError').show();
        isValid = false;
    } else {
        $('#confirmCallError').hide();
    }
    return isValid;
}

function handleSubmit(event) {
    event.preventDefault();
    let specificErrorMessages = [];

    $('#missingFieldsAlert').hide();
    $('#missingFieldsList').empty();
    $('#messageDisplay').hide();

    formFieldsConfig.forEach(config => {
        if (config.required) setFieldError(config.id, '', false);
    });
    $('#confirmCallError').hide();

    const isFormValid = validateForm(specificErrorMessages);

    if (isFormValid) {
        displayGeneralMessage('Form submitted successfully! (This is a demo)', 'success');
    } else {
        if (specificErrorMessages.length > 0) {
            const listItems = specificErrorMessages.map(msg => `<li>${msg}</li>`).join('');
            $('#missingFieldsList').html(listItems);
            $('#missingFieldsAlert').css('display', 'flex');
        }
    }
}

// --- Initialization ---
$(function() { // jQuery document ready

    // List of Fluent UI components used in the form
    const fluentComponentTags = [
        'fluent-select',
        'fluent-option',
        'fluent-radio-group',
        'fluent-radio',
        'fluent-text-field',
        'fluent-checkbox',
        'fluent-text-area',
        'fluent-anchor',
        'fluent-button'
    ];

    // Wait for all Fluent UI components to be defined
    Promise.all(fluentComponentTags.map(tag => customElements.whenDefined(tag)))
        .then(() => {
            console.log('All Fluent UI components are defined. Initializing form.');
            prePopulateForm(); // Populate and set defaults after components are ready

            const $form = $('#transactionForm');
            if ($form.length) {
                $form.on('submit', handleSubmit);
            } else {
                console.error("Transaction form not found!");
            }

            $('.action-buttons fluent-button[appearance="neutral"]').on('click', resetFormAndMessages);
        })
        .catch(error => {
            console.error('Error waiting for Fluent UI components to be defined:', error);
            // Optionally, display an error message to the user
            displayGeneralMessage('Error initializing form components. Please refresh.', 'error');
        });
});
