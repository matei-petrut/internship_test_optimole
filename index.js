const sharp = require('sharp');
const getImages = require('./utils.js');
const fs = require('fs');

exports.handler = async function ( event ) {
	// Get all the images name
    const images = getImages();

    // Arrays of promises for getting initial dimensions and optimize images
    const initDimsProms = [];
    const resizeProms = [];

    // Arrays for storing initial dimensions and infos after optimizing
    const initDims = [];
    const infos = [];
        
    // Create an array of images with new extensions
    const destinationFile = images.map(image => {
        const oldExt = image.slice(image.lastIndexOf('.'), image.length);
        const newExt = '.jpg';

        return image.replace(oldExt, newExt);
    })
    
    // Create the folder optimized where resized images will be stored
    fs.mkdir('./optimized', {recursive: true},  err => {
        if (err) {
            console.log(err);
        }
    })
 
    // Get the initial dimensions of the images
    images.map(image => {
        initDimsProms.push(sharp('./images/' + image)
        .metadata()
        .then(data =>{
            const dims = {
                height: data.height,
                width: data.width
            }

            initDims.push(dims);
        }))
    })
    
    // Resize the images and save them in the optimized folder with the extensions
    images.map((image, index) => {
        resizeProms.push(sharp('./images/' + image)
            .resize(500, 500, {
                fit: 'outside'
            })
            .toFile('./optimized/' + destinationFile[index])
            .then(info => {
                infos.push(info);
            }))
    })

    await Promise.all(initDimsProms);

    await Promise.all(resizeProms);

    const optimized =  [];

    const pass = new Buffer.from(event.optimoleKey, 'base64').toString(); 

    initDims.map((dims, index) => {
        optimized.push({
            filePath: './optimized/' + destinationFile[index],
            procent: Math.floor(100 - Math.min(100*infos[index].height/dims.height, 100*infos[index].width/dims.width)),
        })
    })

    return {
        pass,
        optimized
    };
};