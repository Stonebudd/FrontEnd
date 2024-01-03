// script.js
const addressInput = document.getElementById('addressInput');
const suggestionsContainer = document.getElementById('suggestionsContainer');

let timeoutId;

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
    } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        suggestionsContainer.innerHTML = 'Failed to fetch suggestions.';
    }
}

document.getElementById('propertyType').addEventListener('change', function() {
    const otherOptionsContainer = document.getElementById('otherOptionsContainer');
    if (this.value === 'Other') {
        otherOptionsContainer.style.display = 'block'; // Show the other options
    } else {
        otherOptionsContainer.style.display = 'none';  // Hide the other options
    }
});


function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = suggestion.address; // Adjust according to the actual response structure
        div.onclick = function() {
            addressInput.value = this.textContent; // Update input field with selected suggestion
            suggestionsContainer.innerHTML = ''; // Clear suggestions
        };
        suggestionsContainer.appendChild(div);
    });
}
