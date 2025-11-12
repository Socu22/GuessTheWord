console.log("FlyingCoffe loaded!")


function placeBeans(imageLinks){
    for (const image of imageLinks) {
        const bean = document.createElement("img");
        bean.className = "BEAN";
        bean.src = image;
        bean.alt = "https://static.vecteezy.com/system/resources/previews/060/047/811/non_2x/exquisite-artistic-a-single-coffee-bean-roasted-and-detailed-no-background-with-transparent-background-top-tier-free-png.png";
        bean.width = 10;
        bean.height = 10;
        bean.style.left = 0;
        bean.style.top = 0;

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
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;


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