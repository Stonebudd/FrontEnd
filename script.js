// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Grabbing necessary DOM elements for later use
    const addressInput = document.getElementById('addressInput');
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    const propertyTypeSelect = document.getElementById('propertyType');
    const searchButton = document.getElementById('searchButton');
    const resultContainer = document.getElementById('results');
    let selectedAddressId = null; // Variable to hold the selected address ID
    

    let timeoutId; // For debouncing the address input

    // Event listener for address input
    addressInput.addEventListener('input', function() {
        clearTimeout(timeoutId); // Clear the previous timeout to debounce the input
        const query = this.value;

        if (query.length < 4) { // API requires a minimum of 4 characters
            suggestionsContainer.innerHTML = '';
            return;
        }

        // Wait for a short period before making API call to debounce the input
        timeoutId = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    // Function to fetch address suggestions from the Geoscape API
    async function fetchSuggestions(query) {
        try {
            const response = await fetch(`https://api.psma.com.au/v1/predictive/address?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'XeqZpzTGK6N2XW1DZLCgGsOkG5YuIVZL' // Replace with your actual API key
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            displaySuggestions(data.suggest);
            console.log(data);
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
            suggestionsContainer.innerHTML = 'Failed to fetch suggestions.';
        }
    }

    // Event listener for property type selection
    propertyTypeSelect.addEventListener('change', function() {
        const otherOptionsContainer = document.getElementById('otherOptionsContainer');
        if (this.value === 'Other') {
            otherOptionsContainer.style.display = 'block'; // Show the other options
        } else {
            otherOptionsContainer.style.display = 'none';  // Hide the other options
        }
    });

    // Function to display address suggestions and allow user to select one
    function displaySuggestions(suggestions) {
        suggestionsContainer.innerHTML = ''; // Clear previous suggestions

        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.textContent = suggestion.address;
            div.onclick = function() {
                addressInput.value = this.textContent; // Update input field with selected suggestion
                selectedAddressId = suggestion.id; // Capture the address ID from the suggestion
                suggestionsContainer.innerHTML = ''; // Clear suggestions
            };
            suggestionsContainer.appendChild(div);
        });
    }

    // Event listener for the form submission to fetch details for a specific address ID
    searchButton.addEventListener('click', function(event) {
        event.preventDefault();
        if(!selectedAddressId) {
            alert('Please select an address from suggestions');
            return;
        }
        
        const addressId = document.getElementById('addressId').value;
        const apiUrl = `https://api.psma.com.au/v1/predictive/address/${addressId}`;
        const apiKey = 'XeqZpzTGK6N2XW1DZLCgGsOkG5YuIVZL'; // Replace with your actual API key
      
        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': apiKey,
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
            console.log("API Response Data:", data); // Log the data here to inspect it 
            // Construct the full address from parts
            const fullAddress = [
              data.address.properties.unit_number,
              data.address.properties.street_number_1,
              data.address.properties.street_number_2,
              data.address.properties.street_name,
              data.address.properties.street_type_description,
              data.address.properties.locality_name,
              data.address.properties.state_territory,
              data.address.properties.postcode,
            ].filter(Boolean).join(' ');  // Only include non-empty values and join them with a space
      
            // Filter the data to only show the required parameters
            const selectedData = {
              address: fullAddress,
              property_type: data.address.properties.property_type,
              error: ""  // Assuming you populate this with errors if any occur
            };

          document.getElementById('results').innerHTML = `<pre>${JSON.stringify(selectedData, null, 2)}</pre>`;
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
          document.getElementById('results').textContent = 'Failed to fetch data.';
        });
    });
      
    // Handle the search button click to display selected address and property type
    searchButton.addEventListener('click', function(event) {
        event.preventDefault();
        const addressValue = addressInput.value;

        if (!selectedAddressId) {
            alert('Please select an address from the suggestions.');
            return;
        }

        // Capture the selected property type from the dropdown
        const selectedPropertyType = propertyTypeSelect.value; //Get the selected property type

        // Construct the result data including both the address ID and the selected property type
        const resultData = {
            address: addressInput.value,  // The address text the user selected
            propertyType: selectedPropertyType,
            
        };

        // Display the result data (or you can process it as needed)
        resultContainer.innerHTML = `<pre>${JSON.stringify(resultData, null, 2)}</pre>`;
    });
});






