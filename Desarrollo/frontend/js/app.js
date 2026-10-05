const API_URL = "https://script.google.com/macros/s/AKfycbz0cZ5m6Wrvg6MHMrA9AAVL4ULzkXx02xVypn2K-aUXjwmNTd6ptmyCjaKalEN_VlfP/exec";

async function loadMenu() {
    const response = await fetch(API_URL);

    const data = await response.json();

    console.log(data);
}

loadMenu();