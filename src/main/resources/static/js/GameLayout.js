import {fetchWord, guessWord} from "./JSBackend.js";
import {placeBeans} from "./FlyingCofeeBean.js";
console.log("GameLayout loaded!")

let guessButton;
//let tiplabel;
let tipCorrectText;
let upliftingText;
let inpGuess;
let givUpButton
let repeatBtn;
let stopRepeatBtn;
let y = false;

// store divs globally so we can remove them later
let div, div2, div3, div4, div5, div6;

let x =0
let category;
let images;
let madeReplayButtons = false;
let canGuess = true;


createSearchCategory();

function createSearchCategory(){

        let container = document.createElement("container");
        let title = document.createElement("div")
        let searchfield = document.createElement("input");
        let button = document.createElement("button");
        button.innerText = "Start";
        button.className = "guessButton";
        searchfield.placeholder = "pick a category";
        searchfield.className = "inpGuess";
        searchfield.style.height = "2.49888888vw";
        container.className = "columnContainer centeredContents"
        container.style.height = "70%"
        container.style.gap = "0.567vw"
        title.innerText = "GUESS THE WORD!"
        title.style.fontFamily = "Cursive"
        title.className = "youreRight";
        document.body.append(container);
        container.appendChild(title);
        container.appendChild(searchfield);
        container.appendChild(button);

    button.addEventListener("click", () => createEmojis(searchfield.value));


}


async function createEmojis(category_) {
console.log("category: " + category_)
    if(category_.length === 0){
        console.log("category empty")
        return
    }
    removeGameElements()

    const emojis = document.createElement("label");
    emojis.className = "Emoji";
    emojis.innerHTML = "";
    category = category_
    const loadbar = makeLoadBar();
    const object = await fetchWord(category_, images);
    document.body.removeChild(loadbar);
    for (const emoji of object.emojis) {
        emojis.innerHTML += emoji;
    }

    div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "center";
    //div.style.paddingTop= "10%"

    div.appendChild(emojis);

    tipCorrectText = document.createElement("label")
    tipCorrectText.className = "youreRight";
    tipCorrectText.style.fontSize = "6vw";
    tipCorrectText.style.fontFamily= "Cursive"
    upliftingText = document.createElement("label")
    upliftingText.style.color = "#543a06"
    upliftingText.style.fontFamily= "Cursive"
    upliftingText.style.fontSize="1.5678vw"
    upliftingText.style.textAlign = "center";
    //tiplabel = document.createElement("label");
    //tiplabel.className = "Tiplabel";

    div3 = document.createElement("div");
    div3.style.flexDirection = "column"
    div3.style.alignItems = "center";
    div3.style.display = "flex";
    div3.style.justifyContent = "center";
    div3.style.padding = "1% 0";
    //div3.appendChild(tiplabel);

    inpGuess = document.createElement("input");
    inpGuess.className = "inpGuess";
    inpGuess.placeholder = "Insert Guess";

    guessButton = document.createElement("button");
    guessButton.className = "guessButton";
    guessButton.innerHTML = "Guess";



    div2 = document.createElement("div");
    div2.style.display = "flex";
    div2.style.justifyContent = "center";
    div2.appendChild(inpGuess);

    div4 = document.createElement("div");
    div4.style.display = "flex";
    div4.style.justifyContent = "center";
    div4.style.paddingTop = "1%";
    div4.appendChild(guessButton);

    div5 = document.createElement("div");
    //div5.flexDirection= "column"
    div5.style.display = "flex";

    div5.style.alignContent = "center";
    div5.style.justifyContent = "center";
    div5.style.height = "8vw";

    div6 = document.createElement("div")
    //div6.flexDirection= "column"
    div6.style.display = "flex";

    div6.style.alignContent = "center";
    div6.style.justifyContent = "center";
    div6.style.height = "3.567vw";

     givUpButton = document.createElement("button")
    document.body.appendChild(givUpButton)
    givUpButton.innerHTML = "Give Up"
    givUpButton.className = "guessButton";
    givUpButton.style.position = "fixed";
    givUpButton.style.bottom = "10%";  // distance from bottom
    givUpButton.style.right = "6%";   // distance from right



    div5.appendChild(tipCorrectText);
    div6.appendChild(upliftingText);

    // Append to body
    document.body.append(div5, div6, div, div3, div2, div4);

    guessButton.addEventListener("click", () => guess(object.word));
    givUpButton.addEventListener("click", () => finished(object.word, "Word: ", "black") )

    images = object.images
    placeBeans(object.images);
}

async function guess(word) {
    if(!canGuess){
        return
    }
    canGuess = false;

    console.log(inpGuess.value);
    const loadbar = makeLoadBar();
    const object = await guessWord(inpGuess.value);
    document.body.removeChild(loadbar);

    canGuess = true
    upliftingText.innerHTML = object.upliftingText
    if (object.isItCorrect) {
        tipCorrectText.innerHTML = "That is Correct";
        tipCorrectText.style.color = "darkgreen";
        finished(word, "Correct, the word is: ", "green")

    } else {
        tipCorrectText.innerHTML = "That is wrong";
        tipCorrectText.style.color = "darkred";



        if(x < 3){
            const tiplabel = document.createElement("label");
            tiplabel.className = "Tiplabel";
            tiplabel.innerHTML = object.text;
            tiplabel.style.color = "#543a06";
            div3.appendChild(tiplabel);
        }
       /* if(x === 2) {
          makeReplayButtons()
        }*/
        x++
    }
}
function makeReplayButtons(){
    if(!madeReplayButtons) {
        madeReplayButtons = true;
        repeatBtn = document.createElement("button");
        repeatBtn.innerText = "Again";
        repeatBtn.className = "guessButton";
        document.body.appendChild(repeatBtn);
        repeatBtn.addEventListener("click", () => {
            removeGameElements();
            createEmojis(category);
        });

        stopRepeatBtn = document.createElement("button");
        stopRepeatBtn.innerText = "New Category";
        stopRepeatBtn.style.width = "20%";
        stopRepeatBtn.className = "guessButton";
        document.body.appendChild(stopRepeatBtn);
        stopRepeatBtn.addEventListener("click", () => {
            removeGameElements();
            createSearchCategory()
            images = null;

        });
    }
    const div7 = document.createElement("div");
    div7.style.display = "flex";
    div7.style.alignContent = "center";
    div7.style.justifyContent = "center";
    div7.style.columnGap = "1vw";
    div7.appendChild(repeatBtn);
    div7.appendChild(stopRepeatBtn);
    document.body.appendChild(div7);

}


function finished(word, text, color){
    console.log("giving up")
    div2.removeChild(inpGuess)
    div4.removeChild(guessButton)
    makeReplayButtons()
    tipCorrectText.innerHTML = text + word;
    tipCorrectText.style.color = color
    document.body.removeChild(givUpButton)
    div6.removeChild(upliftingText)
}

function removeGameElements() {

    document.body.innerHTML = ""
    madeReplayButtons = false;
    x=0;

}

function makeLoadBar(){
    let loadBar = document.createElement("img")
    loadBar.src = "https://64.media.tumblr.com/a597edc6fb9b248454087f039d9df122/0985fb8e338df70e-53/s1280x1920/c5204307a07c69bddb3a310bd500986aba12cf67.gif"
    document.body.appendChild(loadBar)
    loadBar.style.width = "12vw";
    loadBar.style.height = "auto"
    loadBar.className = "absoluteCentered"
    return loadBar
}