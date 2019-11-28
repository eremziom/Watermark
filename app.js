const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };
  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  image.quality(100).write(outputFile);
};

//addTextWatermarkToImage('./img/test.jpg', './img/test-with-watermark.jpg', 'Hello world')

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile){
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  image.quality(100).write(outputFile);
};

//addImageWatermarktoImage('./img/test.jpg', './img/test-with-watermark2.jpg', './img/logo.jpg')

const prepareOutputFileName = function (fileName, fileFormat) {
  const spliter = fileName.split(".");
  const addWatermark = spliter[0] + '-watermark';
  const newFileName = addWatermark + '.' + fileFormat;
  return newFileName;
}

///prepareOutputFileName('test.jpg');

const startApp = async () => {

  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
    type: 'confirm'
  }]);

  if(!answer.start) process.exit();

  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }, {
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }, {
    name: 'format',
    type: 'list',
    choices: ['jpg', 'png'],
  },
  {
    name: 'fileName',
    type: 'input',
    message: 'How do you want to name file?',
    default: 'test.jpg',
  },
]);

  if(options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }]);
    options.watermarkText = text.value;
    if(fs.existsSync('./img/' + options.inputImage)){
      addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFileName(options.fileName, options.format), options.watermarkText);
    } else {
      console.log('ERROR! Check if your file exists, or if the name is correct');
    }
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.jpg',
    }]);
    options.watermarkImage = image.filename;
    if(fs.existsSync('./img/' + options.inputImage) && fs.existsSync('./img/' + options.watermarkImage)){
      addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFileName(options.fileName, options.format), './img/' + options.watermarkImage);
    } else {
      console.log('ERROR! Check if your file exists, or if the name is correct');
    }
  }

  console.log('SUCCES! Photo marked')

  const retry = await inquirer.prompt([{
    name: 'retry',
    message: 'Wanna try again?',
    type: 'confirm'
  }]);

  if(!retry.retry) process.exit();
  startApp();
}

startApp();