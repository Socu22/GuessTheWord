import {fetchWord, guessWord} from "./JSBackend.js";
import {placeBeans} from "./FlyingCofeeBean.js";
console.log("GameLayout loaded!")

let guessButton;
let tiplabel;
let tipCorrectText;
let inpGuess;
let category_;
let repeatBtn;
let stopRepeatBtn;
let y = false;

// store divs globally so we can remove them later
let div, div2, div3, div4, div5;

let searchfield = document.createElement("input");
let button = document.createElement("button");
button.innerText = "Start";

document.body.appendChild(searchfield);
document.body.appendChild(button);


if (sessionStorage.getItem("categorySession") != null) {
    document.body.removeChild(searchfield);
    document.body.removeChild(button);
    createEmojis();
}



async function createEmojis() {

    // Remove any previous content first
    removeGameElements();

    if (sessionStorage.getItem("categorySession") === null) {
        category_ = searchfield.value;
        console.log("the category: " + category_);
        document.body.removeChild(searchfield);
        document.body.removeChild(button);
        sessionStorage.setItem("categorySession", category_);
    } else {
        category_ = sessionStorage.getItem("categorySession");
        console.log("the category: " + category_);


    }
    const category= category_;
    const emojis = document.createElement("label");
    emojis.className = "Emoji";
    emojis.innerHTML = "";
    const object = await fetchWord(category);
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
    tiplabel = document.createElement("label");
    tiplabel.className = "Tiplabel";

    div3 = document.createElement("div");
    div3.style.display = "flex";
    div3.style.justifyContent = "center";
    div3.style.padding = "1% 0";
    div3.appendChild(tiplabel);

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
    div5.style.display = "flex";
    div5.style.alignContent = "center";
    div5.style.justifyContent = "center";
    div5.style.height = "20%";

    div5.appendChild(tipCorrectText);

    // Append to body
    document.body.append(div5, div, div3, div2, div4);

    guessButton.addEventListener("click", () => guess());
    placeBeans(object.images);
}
let x =0
async function guess() {


    console.log(inpGuess.value);
    const object = await guessWord(inpGuess.value);
    if (object.isItCorrect) {
        tipCorrectText.innerHTML = "That is Correct. ";
        tipCorrectText.style.color = "green";
        div2.removeChild(inpGuess)
        div4.removeChild(guessButton)
    } else {
        tipCorrectText.innerHTML = "That is wrong. -";
        tipCorrectText.style.color = "red";
        tiplabel.innerHTML += object.text + "<br>";
        x++
        if(x===3){
            x=0;

            repeatBtn = document.createElement("button");
            repeatBtn.innerText = "Repeat";
            document.body.appendChild(repeatBtn);
            repeatBtn.addEventListener("click", () => {
                removeGameElements();
                createEmojis();
            });

            stopRepeatBtn = document.createElement("button");
            stopRepeatBtn.innerText = "Stop-Repeat";
            document.body.appendChild(stopRepeatBtn);
            stopRepeatBtn.addEventListener("click", () => {
                removeGameElements();
                sessionStorage.removeItem("categorySession");
                createEmojis();
                y=true

            });

        }
    }
}

button.addEventListener("click", () => createEmojis());

// 🧹 helper to delete previous divs safely
function removeGameElements() {
    for (const element of [div, div2, div3, div4, div5, repeatBtn, stopRepeatBtn]) {
        if (element && document.body.contains(element)) {
            document.body.removeChild(element);
        }
    }
    recreateStartUIIfNeeded()
}
function recreateStartUIIfNeeded() {
    if (y) {
        y = false; // reset right away so it doesn't trigger twice
        searchfield = document.createElement("input");
        button = document.createElement("button");
        button.innerText = "Start";
        document.body.appendChild(searchfield);
        document.body.appendChild(button);
        button.addEventListener("click", () => createEmojis());
    }
}