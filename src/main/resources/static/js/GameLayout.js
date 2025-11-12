import {fetchWord, guessWord} from "./JSBackend.js";
import {placeBeans} from "./FlyingCofeeBean.js";
console.log("GameLayout loaded!")

let guessButton;
let tiplabel
let tipCorrectText
let inpGuess

const searchfield = document.createElement("input")
const button = document.createElement("button")
document.body.appendChild(searchfield)
document.body.appendChild(button)

async function createEmojis(){
    const category = searchfield.value
    console.log("the category: " + category)
    document.body.removeChild(searchfield)
    document.body.removeChild(button)

    const emojis = document.createElement("label");
    emojis.className = "Emoji";
    emojis.innerHTML = "";
    const object = await fetchWord(category)
    for (const emoji of object.emojis){
        emojis.innerHTML += emoji;
    }



    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignContent = "center";
    div.style.justifyContent = "center";
    div.style.paddingTop= "10%"

    div.appendChild(emojis);

    tipCorrectText = document.createElement("label")
    tipCorrectText.className = "Tiplabel";
    tiplabel = document.createElement("label");
    tiplabel.className = "Tiplabel";
    tiplabel.innerHTML = "";



    const div3 = document.createElement("div");
    div3.style.display = "flex";
    div3.style.alignContent = "center";
    div3.style.justifyContent = "center";
    div3.style.paddingBottom = "1%";
    div3.style.paddingTop = "1%";




    inpGuess = document.createElement("input");
    inpGuess.className = "inpGuess";
    inpGuess.placeholder = "Insert Guess"
    inpGuess.style.paddingBottom = "1%";

    guessButton = document.createElement("button")
    guessButton.innerHTML = "Guess"

    const div4 = document.createElement("div");
    div4.style.display = "flex";
    div4.style.alignContent = "center";
    div4.style.justifyContent = "center";
    div4.appendChild(guessButton)


    const div2 = document.createElement("div");
    div2.style.display = "flex";
    div2.style.alignContent = "center";
    div2.style.justifyContent = "center";

    const div5 = document.createElement("div")
    div5.style.display = "flex";
    div5.style.alignContent = "center";
    div5.style.justifyContent = "center";

    div5.appendChild(tipCorrectText);
    div3.appendChild(tiplabel);
    div2.appendChild(inpGuess);
    document.body.appendChild(div5)
    document.body.appendChild(div);
    document.body.appendChild(div3);
    document.body.appendChild(div2);
    document.body.appendChild(div4);

    guessButton.addEventListener("click", r => {guess()})

    placeBeans(object.images)
}

async function guess(){
    console.log(inpGuess.value)
    const object = await guessWord(inpGuess.value)
    if (object.isItCorrect){
        tipCorrectText.innerHTML = "That is Correct. "
        tipCorrectText.style.color = "green"
    }
    else{
        tipCorrectText.innerHTML = "That is wrong. -"
        tipCorrectText.style.color = "red"
        tiplabel.innerHTML +=  object.text + "<br>";
    }


}

button.addEventListener("click", r => {createEmojis()})

//createEmojis();