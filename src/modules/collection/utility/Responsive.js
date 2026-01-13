import {Dimensions, PixelRatio} from 'react-native';

const {height, width} = Dimensions.get('window');
const screenHeight = Dimensions.get('screen').height;
const screenWidth = Dimensions.get('screen').width;

// Convert given Width into DensityPixel
const dpforWidth = (receivedWidth) => {
  let givenWidth =
    typeof receivedWidth === 'number'
      ? receivedWidth
      : parseFloat(receivedWidth);
  return PixelRatio.roundToNearestPixel((width * givenWidth) / 100);
};

const dpforHeight = (receivedHeight) => {
  let givenHeight =
    typeof receivedWidth === 'number'
      ? receivedHeight
      : parseFloat(receivedHeight);
  return PixelRatio.roundToNearestPixel((height * givenHeight) / 100);
};

export {dpforHeight, dpforWidth, screenHeight, screenWidth};