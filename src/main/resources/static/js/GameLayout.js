
console.log("GameLayout loaded!")


const emojis = document.createElement("label");
emojis.className = "Emoji";
emojis.innerHTML = "🦁🦐🧟‍♀️👥👁️";



const div = document.createElement("div");
div.style.display = "flex";
div.style.alignContent = "center";
div.style.justifyContent = "center";
div.style.paddingTop= "10%"

div.appendChild(emojis);

const tiplabel = document.createElement("label");
tiplabel.className = "Tiplabel";
tiplabel.innerHTML = "Label text ------------------------------------------";


const div3 = document.createElement("div");
div3.style.display = "flex";
div3.style.alignContent = "center";
div3.style.justifyContent = "center";
div3.style.paddingBottom = "1%";
div3.style.paddingTop = "1%";




const inpGuess = document.createElement("input");
inpGuess.className = "inpGuess";
inpGuess.placeholder = "Insert Guess"
inpGuess.style.paddingBottom = "1%";



const div2 = document.createElement("div");
div2.style.display = "flex";
div2.style.alignContent = "center";
div2.style.justifyContent = "center";

div3.appendChild(tiplabel);
div2.appendChild(inpGuess);
document.body.appendChild(div);
document.body.appendChild(div3);
document.body.appendChild(div2);