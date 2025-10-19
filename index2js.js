

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedNumber = urlParams.get('number');
    
    // Add console.log to debug
    console.log("URL params:", window.location.search);
    console.log("Selected number:", selectedNumber);
    
    const element = document.getElementById('selected-number');
    // Add another console.log
    console.log("Found element:", element);
    
    if (element) {
        element.textContent = selectedNumber;
    }
});
