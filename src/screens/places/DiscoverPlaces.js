import React from 'react';
import { StyleSheet, View, Platform, Alert, TouchableHighlight, Modal, Image } from 'react-native';
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, H1 } from 'native-base';
import { MapView, Permissions } from "expo";
import {Ionicons} from '@expo/vector-icons';
import createOpenLink from 'react-native-open-maps';
import Constants from 'expo-constants';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import * as Location from 'expo-location';


/*
This page can be used to allow people to discover places. All the places users can travel or else places near that person can be sent from the backend and these data can be shown in this page.
When the user clicks on a place he or she can view details about that place. After that, user can click on to open directions from google maps.
*/

const Style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFill
  },
});

//Users Current Location
const INITIAL_POSITION = {
  latitude: 7.8731,
  longitude: 80.7718,
  latitudeDelta: 1,
  longitudeDelta: 1
}

//Places to travel
const COORDS = [
  { id:1, latitude: 8.3114, longitude: 80.4037, title:'Anuradhapura', image: 'http://www.srilankanguru.com/wp-content/uploads/2016/08/img_4705.jpg', description:'Anuradhapura (Sinhalese: අනුරාධපුරය ; Tamil: அனுராதபுரம்) is a major city in Sri Lanka. It is the capital city of North Central Province, Sri Lanka and the capital of Anuradhapura District. Anuradhapura is one of the ancient capitals of Sri Lanka, famous for its well-preserved ruins of ancient Sri Lankan civilization.' },
  { id:2, latitude: 7.9403, longitude: 81.0188, title:'Polonnaruwa', image: 'http://www.srilankanguru.com/wp-content/uploads/2016/08/img_4705.jpg', description:'Description2' },
  { id:3, latitude: 6.9497, longitude: 80.7891, title:'Nuwara Eliya', image: 'http://www.srilankanguru.com/wp-content/uploads/2016/08/img_4705.jpg', description:'Description3' },
  { id:4, latitude: 7.9672, longitude: 80.7600, title:'Sigiriya', image: 'http://www.srilankanguru.com/wp-content/uploads/2016/08/img_4705.jpg', description:'Description4' },
  { id:5, latitude: 8.3500, longitude: 80.3912, title:'Ruwanwelisaya', image: 'http://www.srilankanguru.com/wp-content/uploads/2016/08/img_4705.jpg', description:'Description5' }
];

export default class App extends React.Component {
  state = {
    region: INITIAL_POSITION,
    location: null,
    errorMessage: null,
    modalVisible: false,
    modelData: { id:1, latitude: 8.3114, longitude: 80.4037, title:'Anuradhapura', description:'Description' }
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });

    const CURRENT_POSITION = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 1,
        longitudeDelta: 1
      }
    this.setState({region : CURRENT_POSITION})
    console.log(this.state.region)
  };

  markerClick(x,y, travelToGoogleName){
    //console.log(x)
    //console.log(y)
    const travelTo = { 
        latitude: x,
        longitude: y,
        //start:'Colombo',
        end: travelToGoogleName, 
        travelType: "drive"};
    //console.log(travelTo)
    createOpenLink(travelTo);
  }

  setModalVisible(visible, travelData ) {
    this.setState({ modalVisible: visible });
  }

  setModalData( travelData ) {
    this.setState({ modelData: travelData });
    }

  render() {
    const { region } = this.state;
    return (
      <View style={Style.container}>

      <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            //Alert.alert('Modal has been closed.');
            this.setModalVisible(!this.state.modalVisible);
          }}
          >
            <Container>
            <Content>
            <Card style={{flex: 0}}>
                <CardItem header bordered>
                <Left>
                    <Body>
                    <H1>{this.state.modelData.title}</H1>
                    </Body>
                </Left>
                </CardItem>
                <CardItem>
                <Body >
                    <Image source={{uri: this.state.modelData.image}} style={{width: '100%', height: 200, flex: 1}}/>
                    <Text style={{marginTop: 20}}>
                    {this.state.modelData.description}
                    </Text>
                </Body>
                </CardItem>
                <CardItem></CardItem>
                    <Button iconLeft primary full onPress={() => {this.markerClick(this.state.modelData.latitude,this.state.modelData.longitude,this.state.modelData.title )}}>
                        <Icon name='airplane' />
                        <Text>Travel</Text>
                    </Button>
                <CardItem></CardItem>    
                    <Button iconLeft danger full onPress={() => {this.setModalVisible(!this.state.modalVisible);}}>
                        <Icon name='close' />
                        <Text>Close</Text>
                    </Button>
                <CardItem></CardItem>
            </Card>
            </Content>
        </Container>
        </Modal>

        


        <MapView
          provider={MapView.PROVIDER_GOOGLE}
          style={Style.map}
          loadingIndicatorColor={"#ffbbbb"}
          loadingBackgroundColor={"#ffbbbb"}
          region={region}
        >
          {COORDS.map((m) =>
            <MapView.Marker 
                key={m.id } 
                coordinate={{
                    latitude: m.latitude,
                    longitude: m.longitude
                }}
                title={m.title}
                description={m.description}
                //onPress={() => this.markerClick(m.latitude, m.longitude)}
                onPress={() => {this.setModalData(m); this.setModalVisible(!this.state.modalVisible);}}
                //image={flagPinkImg}
                
            />
          )}
        </MapView>
      </View>
    );
  }
}

