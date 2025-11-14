import {fetchAnyUrl} from "./moduleJSON.js";

console.log("JSBackend loaded!");

//let category = "league of legends characters";
let emojis = []; // Initialize as an array
let word;


async function fetchWord(category, images_) {
    if (category.length > 0) {
        const object = await fetchAnyUrl(window.location.origin + "/chooseWord?category=" + encodeURIComponent(category))
        console.log(window.location.origin + "/chooseWord?category=" + encodeURIComponent(category));
        emojis = object.emojis; // Assign the emojis array
        word = object.word;
        console.log("Emojis 2:", emojis);
        console.log("Word 2:", word);

        console.log("images: " + images_ + "length: " + (images_ === undefined))
        if(images_ === undefined || images_ === null){
            const images = await getImages(category);
            object.images = images.images;
        }
        else {
            object.images = images_;
        }
        return object;
    } else {
        console.warn("Category is empty!");
    }
    return null
}
async function guessWord(guessedWord) {
    if (guessedWord.length > 0) {
        const object = await fetchAnyUrl(window.location.origin + "/guessWord?guessedWord=" + encodeURIComponent(guessedWord))
        //console.log(window.location.origin + "/chooseWord?category=" + encodeURIComponent(guessedWord));
        //isItCorrect = object.isItCorrect; // Assign the emojis array
       // word = object.word;
        console.log("isItCorrect:", object.isItCorrect);
        console.log("content:", object.text);
        console.log("upliftingText:", object.upliftingText);
        return object;
    } else {
        console.warn("Category is empty!");
    }
    return null
}
async function getImages(category) {
    if (category.length > 0) {
        const object = await fetchAnyUrl(window.location.origin + "/getImage?search=" + encodeURIComponent(category))
        //console.log(window.location.origin + "/chooseWord?category=" + encodeURIComponent(guessedWord));
        //isItCorrect = object.isItCorrect; // Assign the emojis array
        // word = object.word;
        if(object.images != null){
            for (const image of object.images){
                console.log(image)
            }
        }

        return object;
    } else {
        console.warn("Category is empty!");
    }
    return null
}

// Call the function
///fetchWord();
export {fetchWord, guessWord};