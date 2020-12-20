const path = require('path');
const fs = require('fs');

const imgsDirectory = path.join(__dirname, 'images');

const getImages = () => {
    const imgs = fs.readdirSync(imgsDirectory);

    return imgs;
}

module.exports = getImages;

 



