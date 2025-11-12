console.log("JSBackend loaded!");

let category = "league of legends characters";
let emojis = []; // Initialize as an array
let word;

async function fetchWord() {
    if (category.length > 0) {
        try {
            const response = await fetch(window.location.origin + "/chooseWord?category=" + encodeURIComponent(category));
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const object = await response.json();
            emojis = object.emojis; // Assign the emojis array
            word = object.word;
            console.log("Emojis:", emojis);
            console.log("Word:", word);
        } catch (error) {
            console.error("Error fetching word:", error);
        }
    } else {
        console.warn("Category is empty!");
    }
}

// Call the function
fetchWord();
