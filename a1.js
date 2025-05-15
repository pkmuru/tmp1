$(document).ready(() => {
    // Hide validation alert on page load
    $("#validationAlert").hide()    
  
    // Initialize form data from API
    initializeFormData()
  
    // Set default date to today
    const today = new Date()
    const formattedDate = formatDateForInput(today)
    $("#date").val(formattedDate)
  
    function formatDateForInput(date) {
      return date.toISOString().split("T")[0]
    }
  
      
    // Initialize form data from API calls
    async function initializeFormData() {
      try {
        // Show loading indicator
        $("#loadingIndicator").show()
        $("#transactionForm").hide()
     
        // Fetch all data in parallel
        const [clientAccounts, payeeAccounts, transactionTypes, currencies, reasons, phoneNumbers, accountBalances] =
          await Promise.all([
            API.getClientAccounts(),
            API.getPayeeAccounts(),
            API.getTransactionTypes(),
            API.getCurrencies(),
            API.getReasons(),
            API.getPhoneNumbers(),
            API.getAccountBalances(),
          ])
  
        // Populate dropdowns
        populateDropdown("#clientAccount", clientAccounts)
        populateDropdown("#payeeAccount", payeeAccounts)
        populateDropdown("#transactionType", transactionTypes)
        populateDropdown("#currency", currencies, "USD")
        populateDropdown("#reason", reasons, "gift")
        populateDropdown("#phoneNumber", phoneNumbers)
  
        // Set account balances
        const { cashAvailable, withdrawalLimit } = accountBalances
        $("#cashAvailable").text(
          `$${cashAvailable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        )
        $("#withdrawalLimit").text(
          `$${withdrawalLimit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        )
  
        // Hide loading indicator and show form
        $("#loadingIndicator").hide()
        $("#transactionForm").fadeIn(300)
      } catch (error) {
        // Handle API error
        console.error("Error loading form data:", error)
        $("#loadingIndicator").hide()
        $("#apiErrorMessage").text(error.error || "Unable to load form data. Please try again later.")
       
      }
    }
  
    function populateDropdown(selector, data, selectedValue = null) {
      const dropdown = $(selector)
      // Keep the first option (placeholder)
      const firstOption = dropdown.find("option").first()
      dropdown.empty().append(firstOption)
  
      // Add options from data
      $.each(data, (i, item) => {
        const option = $("<option></option>").attr("value", item.id).text(item.name)
  
        if (selectedValue && item.id === selectedValue) {
          option.attr("selected", "selected")
        }
  
        dropdown.append(option)
      })
    }
  
    // Format amount input
    $("#amount").on("focus", function () {
      const value = $(this)
        .val()
        .replace(/[^\d.]/g, "")
      if (value === "0.00") {
        $(this).val("")
      } else {
        $(this).val(value)
      }
    })
  
    $("#amount").on("blur", function () {
      const value = $(this).val()
      if (value === "" || isNaN(Number.parseFloat(value))) {
        $(this).val("0.00")
      } else {
        $(this).val(Number.parseFloat(value).toFixed(2))
      }
    })
  
    // Reset validation state
    function resetValidation() {
      // Hide alert
      $("#validationAlert").hide()
      $("#validationMessages").empty()
  
      // Remove validation classes
      $(".is-invalid").removeClass("is-invalid")
    }
  
    // Handle form submission
    $("#transactionForm").on("submit", function (e) {
      e.preventDefault()
  
      // Reset previous validation state
      resetValidation()
  
      // Validate form and collect validation messages
      const validationMessages = []
      let isValid = true
  
      // Check required fields
      if (!$("#clientAccount").val()) {
        validationMessages.push("Client account selection required")
        $("#clientAccount").addClass("is-invalid")
        isValid = false
      }
  
      if (!$("#payeeAccount").val()) {
        validationMessages.push("Payee account selection required")
        $("#payeeAccount").addClass("is-invalid")
        isValid = false
      }
  
      if (!$("#transactionType").val()) {
        validationMessages.push("Transaction type selection required")
        $("#transactionType").addClass("is-invalid")
        isValid = false
      }
  
      const amount = Number.parseFloat($("#amount").val())
      const cashAvailable = Number.parseFloat(
        $("#cashAvailable")
          .text()
          .replace(/[^0-9.-]+/g, ""),
      )
      const withdrawalLimit = Number.parseFloat(
        $("#withdrawalLimit")
          .text()
          .replace(/[^0-9.-]+/g, ""),
      )
  
      if (isNaN(amount) || amount <= 0) {
        validationMessages.push("Valid amount required (greater than 0)")
        $("#amount").addClass("is-invalid")
        isValid = false
      } else if (amount > cashAvailable) {
        validationMessages.push(
          `Amount exceeds available cash ($${cashAvailable.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
        )
        $("#amount").addClass("is-invalid")
        isValid = false
      } else if (amount > withdrawalLimit) {
        validationMessages.push(
          `Amount exceeds withdrawal limit ($${withdrawalLimit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
        )
        $("#amount").addClass("is-invalid")
        isValid = false
      }
  
      if (!$("#currency").val()) {
        validationMessages.push("Currency selection required")
        $("#currency").addClass("is-invalid")
        isValid = false
      }
  
      if (!$("#date").val()) {
        validationMessages.push("Date required")
        $("#date").addClass("is-invalid")
        isValid = false
      } else {
        // Check if date is within 14 days of today
        const today = new Date()
        const selectedDate = new Date($("#date").val())
        const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24))
  
        if (daysDiff < 14) {
          validationMessages.push("Date change < 14 days")
          $("#date").addClass("is-invalid")
        }
      }
  
      if (!$("#reason").val()) {
        validationMessages.push("Reason for disbursement required")
        $("#reason").addClass("is-invalid")
        isValid = false
      }
  
      if (!$("#confirmCall").prop("checked")) {
        validationMessages.push("Client confirmation required")
        $("#confirmCall").addClass("is-invalid")
        isValid = false
      }
  
      // Display validation messages if any
      if (validationMessages.length > 0) {
        $("#validationMessages").empty()
  
        validationMessages.forEach((message) => {
          $("#validationMessages").append(`<li>${message}</li>`)
        })
  
        $("#validationAlert").show()
        return
      }
  
      // Collect form data
      const formData = {
        clientAccount: $("#clientAccount").val(),
        payeeAccount: $("#payeeAccount").val(),
        transactionType: $('input[name="transactionType"]:checked').val(),
        type: $("#transactionType").val(),
        amount: $("#amount").val(),
        currency: $("#currency").val(),
        waiveFee: $("#waiveFee").prop("checked"),
        date: $("#date").val(),
        reason: $("#reason").val(),
        memo: $("#memo").val(),
        phoneNumber: $("#phoneNumber").val(),
        confirmed: $("#confirmCall").prop("checked"),
      }
  
      // Show loading state
      const $submitBtn = $(this).find('button[type="submit"]')
      const originalText = $submitBtn.text()
      $submitBtn
        .prop("disabled", true)
        .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...')
  
      // Make API request
      API.submitTransaction(formData)
        .then((response) => {
          // Reset button
          $submitBtn.prop("disabled", false).text(originalText)
  
          // Show success message
          alert(`Transaction submitted successfully! Transaction ID: ${response.transactionId}`)
  
          // Reset form (optional)
          // $('#transactionForm')[0].reset();
        })
        .catch((error) => {
          // Reset button
          $submitBtn.prop("disabled", false).text(originalText)
  
          // Show error message
          $("#validationMessages").empty().append(`<li>${error.message}</li>`)
          $("#validationAlert").show()
        })
    })
  
    // Handle close and dismiss buttons
    $("#closeBtn, #dismissBtn").on("click", () => {
      if (confirm("Are you sure you want to dismiss this transaction? This action cannot be recalled.")) {
        alert("Transaction dismissed.")
        // In a real application, you might redirect or close a modal here
      }
    })
  
    // Retry loading data button
    $("#retryLoadingBtn").on("click", () => {
      initializeFormData()
    })
  })
  
