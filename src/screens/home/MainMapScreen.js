import React from 'react';
import {Image, Platform} from 'react-native';
import {Container} from 'native-base';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import {AppLoading} from "expo";
import RequestHandler from '../../util/RESTRequestHandler'
import Util from "../../util/Util";


const touristIcon = require('../../../assets/images/tourist.png');
const shopIcon = require('../../../assets/images/shop.png');
const mapIcon = require('../../../assets/images/map-location.png');

export default class MainMapScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            location: null,
            myLocation1: null,
            myLocation2: null,
            attractionsList: [],
            servicesList: [],
            errorMessage: null,
            isLoading: true,
        };
    }

    componentDidMount() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }
        //this._watchLocationAsync();
    }

    _watchLocationAsync = async () => {

        this.watchId = await navigator.geolocation.watchPosition(
            (position) => {
                console.log(position);
                let state = this.state;
                state.location.coords = position.coords;
                this.setState(state);
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0, distanceFilter: 1},

        );
    };

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied ',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log('LOCATION');
        console.log(location);
        let state = await this._discoverAttaractionsRequest(location.coords.longitude, location.coords.latitude);

        state.location = location;
        state.myLocation1 = {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        };
        state.isLoading = false;
        this.setState(state);
        console.log('state');
        console.log(state);
    };


    // Fetch the token from storage then navigate to our appropriate place
    _discoverAttaractionsRequest = async (longitude, latitude) => {
        let state = this.state;
        console.log("attaractionsReq");
        let attaractionsResp = await RequestHandler.sendDiscoverAttaractionsRequest(longitude, latitude);
        let servicesResp = await RequestHandler.sendDiscoverServiceRequest(longitude, latitude);
        console.log("attaractionsResp");
        console.log(attaractionsResp);
        if (attaractionsResp.status === 'SUCCESS') {
            for (let i = 0; i < attaractionsResp.attractions.length; i++) {
                state.attractionsList.push(attaractionsResp.attractions[i]);
            }
        } else {
            alert("Couldn't discover tourist attractions near your place");
        }
        console.log("serviceResp");
        console.log(servicesResp);
        if (servicesResp.status === 'SUCCESS') {
            for (let i = 0; i < servicesResp.attaractions.length; i++) {
                state.servicesList.push(servicesResp.attaractions[i]);
            }
        } else {
            alert("Couldn't discover tourist services near your place");
        }

        return state;
    };

    _handleMapRegionChange = async (region) => {
        // let state = this.state;
        // // console.log("region test");
        // // console.log(region);
        // if(state.myLocation1) {
        //     state.myLocation1 = undefined;
        //     state.myLocation2 = {
        //         longitude: region.longitude,
        //         latitude: region.latitude
        //     };
        // } else {
        //     state.myLocation2 = undefined;
        //     state.myLocation1 = {
        //         longitude: region.longitude,
        //         latitude: region.latitude
        //     };
        //
        // }
        // this.setState(state);
    };

    _handleOnClickAttraction = async (attraction) => {
        console.log("attraction");
        console.log(attraction);
        await Util.putAttractionProfileParams(attraction);
        await this.props.navigation.navigate('AttractionScreen');
    };

    _handleOnClickService = async (service) => {
        console.log("service");
        console.log(service);
        await Util.putServiceProfileParams(service);
        await this.props.navigation.navigate('ServiceScreen');
    };

    render() {
        if (this.state.isLoading) {
            return <AppLoading/>;
        }
        console.log('state');
        console.log(this.state);
        return (
            <Container>
                <MapView
                    style={{ alignSelf: 'stretch', height: '100%' }}
                    region={{ latitude: this.state.location.coords.latitude,
                        longitude: this.state.location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
                >
                    <MapView.Marker
                        coordinate={this.state.location.coords}
                        title="I'm Here"
                        description="Look around to discover more!"
                    >

                        <Image source={touristIcon} style={{ width: 50, height: 50 }} />
                    </MapView.Marker>
                    {
                        this.state.attractionsList && this.state.attractionsList.map((attraction) => (

                            <MapView.Marker
                                coordinate={{
                                    accuracy: this.state.location.accuracy,
                                    longitude: attraction.longitude,
                                    latitude: attraction.latitude,
                                    altitude: this.state.location.altitude,
                                    heading: this.state.location.heading,
                                    speed: this.state.location.speed
                                }}
                                title={attraction.attractionName}
                                description={attraction.description}
                                key={'ATR'+attraction.attaractionId}
                                id={'ATR'+attraction.attaractionId}
                                onPress={(value) => this._handleOnClickAttraction(attraction)}
                            >
                                <Image source={mapIcon} style={{ width: 50, height: 50 }} />
                            </MapView.Marker>
                        ))
                    }
                    {
                        this.state.servicesList && this.state.servicesList.map((service) => (
                            <MapView.Marker
                                coordinate={service.location}
                                title={service.name +''+ (service.fee ? ' | ' + service.fee + ' LKR': '')}
                                description={service.description}
                                key={'SVC'+service.serviceId}
                                id={'SVC'+service.serviceId}
                                onPress={(value) => this._handleOnClickService(service)}
                            >
                                <Image source={shopIcon} style={{ width: 50, height: 50 }} />
                            </MapView.Marker>
                        ))
                    }
                </MapView>
            </Container>
        );
    }

}