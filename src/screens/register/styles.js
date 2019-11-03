const React = require("react-native");
const { Dimensions, Platform } = React;
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;


export default {
  imageContainer: {
    flex: 1,
    resizeMode: 'contain',
    width: deviceWidth,
    height: deviceHeight
  },

  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
  }
};
