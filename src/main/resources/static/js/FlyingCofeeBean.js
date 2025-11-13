console.log("FlyingCoffe loaded!")


function placeBeans(imageLinks){
    let currentImage = 0;
    for (let i = 0; i < 10; i++) {
        const bean = document.createElement("img");
        bean.className = "BEAN";
        if(imageLinks != null){
            bean.src = imageLinks[currentImage]
            currentImage++;
            if(currentImage === imageLinks.length)
                currentImage = 0;
            bean.onerror = function() {
               // imageLinks.splice(currentImage, 1);
                bean.src = "https://static.vecteezy.com/system/resources/thumbnails/049/233/931/small_2x/cool-dude-emoji-a-stylish-emoji-with-sunglasses-exuding-a-laid-back-and-confident-vibe-free-png.png"
               //delete imageLinks[currentImage]

            };
        }
        else{
            bean.src = "https://static.vecteezy.com/system/resources/previews/060/047/811/non_2x/exquisite-artistic-a-single-coffee-bean-roasted-and-detailed-no-background-with-transparent-background-top-tier-free-png.png"
        }

        //bean.alt = "https://static.vecteezy.com/system/resources/previews/060/047/811/non_2x/exquisite-artistic-a-single-coffee-bean-roasted-and-detailed-no-background-with-transparent-background-top-tier-free-png.png";

        bean.style.width = "6%";
        bean.style.height = "auto"
        bean.style.left = "0px";
        bean.style.top = "0px";

        // random starting position
        bean.style.position = "absolute";

        document.body.appendChild(bean);
    }

    //get all BEAN classname
    const images = document.getElementsByClassName('BEAN');

    for (const img of images) {

        // Start immediately
        moveImage(img);

        // Move each image at a slightly different random interval (2.5–4s)
        setInterval(() => moveImage(img), 2500 + Math.random() * 1500);

    }

}





    const moveImage = (img) => {



    const maxX = window.innerWidth - img.clientWidth;
    const maxY = window.innerHeight - img.clientHeight;

    // Generate random X and Y within the screen
    //const randomX = Math.random() * maxX;

    const upOrDown = Math.round( Math.random());
    let randomY = Math.random() * (maxY/4);
    if(upOrDown === 0){
        randomY = maxY -randomY;
    }


    const upOrDownX = Math.round( Math.random());
    let randomX = Math.random() * (maxX/5);
    if(upOrDownX === 0) {
        randomX = maxX -randomX;
    }



    const rect = img.getBoundingClientRect();
    const x1 = rect.left + rect.width / 2;
    const y1 = rect.top + rect.height / 2;

    // Get mouse position
    const x2 = randomX;
    const y2 = randomY;

    // Compute angle in radians and convert to degrees
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    // Combine both rotation and translation
    img.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${angle}deg)`;


};


export {placeBeans};