import {fetchAnyUrl, postObjectAsJson} from "./moduleJSON.js"

let category = "league of legends characters";
let emojis;
let word;

async function fetchWord(){
    if(!category.length === 0){
        const object = await fetchAnyUrl(window.location.origin + "/chooseWord?category=" + category);
        for (const emoji of object.emojis){
            emojis.add(emoji)
            console.log(emoji);
        }
        word = object.word;
        console.log(word);
    }
}

fetchWord().then(r => {})