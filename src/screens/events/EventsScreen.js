import React, {Component} from 'react';
import {
    Body,
    Button,
    Container,
    Content,
    Footer,
    FooterTab,
    H1,
    H2,
    H3,
    Icon,
    Left,
    ListItem,
    Right,
    Segment,
    Spinner,
    Text,
    View, Item, Label, Input, Textarea, Thumbnail
} from 'native-base';
import {Dimensions, Image, ScrollView, StyleSheet, RefreshControl} from 'react-native';
import RequestHandler from '../../util/RESTRequestHandler';
import SearchableDropdown from 'react-native-searchable-dropdown';
import RadioForm from 'react-native-simple-radio-button';
import bgImgStyle from "../register/styles";
import MapView from 'react-native-maps';
import Util from "../../util/Util";
import * as ImagePicker from 'expo-image-picker';
import {Avatar} from 'react-native-elements';
import * as Location from 'expo-location';
import DateTimePicker from "react-native-modal-datetime-picker";

const icon = require('../../../assets/images/event.png');


const userImage = require("../../../assets/images/travelified-logo.png");
const config = require('../../config/config.json');


export default class TravelExpensesEstimateScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            screen: 1,
            userFriends: undefined,
            userLocation: undefined,
            eventInvitees: [],
            isLoading: true,
            isDateTimePickerVisible: false,
            eventName: undefined,
            eventNameError: undefined,
            eventDescription: undefined,
            eventDescriptionError: undefined,
            eventDateError: undefined,
            eventDateLong: undefined,
            eventDate: undefined,
            eventTimeError: undefined,
            image: undefined,
            myEvents: [],
            myInvites: [],
            tab1Color: '#9195ae',
            tab2Color: '#00ae7e',
            tab3Color: '#00ae7e'
        }
    }

    _componentFocused = () => {
        this._loadScreenParams();
    };

    componentWillUnmount() {
        this._sub.remove();
    }

    componentDidMount() {
        this._componentFocused();

        this._sub = this.props.navigation.addListener(
            'didFocus',
            this._componentFocused
        );
    }

    async _loadScreenParams() {
        let state = this.state;
        let token = await Util.getAuthToken();
        let location = await Location.getCurrentPositionAsync({});
        let friendsResp = await RequestHandler.getAllMyFriends(token.username);
        if(friendsResp.status === 'SUCCESS') {
            state.userFriends = friendsResp.userFriendList;
        }
        if(location) {
            state.userLocation = location;
        }
        state.isLoading = false;
        this.setState(state);
        console.log(friendsResp);

    }

    render() {
        if (this.state.isLoading) {
            return (
                <Container
                    style={{alignItems: 'center', alignSelf: 'center', marginTop: Dimensions.get('window').height / 3}}>
                    <Content>
                        <Spinner color='blue'/>
                    </Content>
                </Container>
            );

        }
        console.log("Rendering State H1 ");
        console.log(this.state);
        console.log(this.state.userImageURL);
        if (this.state.screen === 1) {
            return this._returnNewEventScreen();
        } else if (this.state.screen === 2) {
            return this._returnMyEventScreen();
        } else {
            return this._returnAllMyEventScreen();
        }
    }

    _handleEventNameChangeAsync = async (name) => {
        let state = this.state;
        state.eventName = name;
        state.eventNameError = undefined;
        this.setState(state);
    };

    _handleEventDescriptionChangeAsync = async (description) => {
        let state = this.state;
        state.eventDescription = description;
        state.eventDescriptionError = undefined;
        this.setState(state);
    };

    _handleEventDateChangeAsync = async (date) => {
        console.log(date.getTime());
        let state = this.state;
        state.eventDateLong = date.getTime();
        state.eventDate = date;
        state.eventDateError = undefined;
        state.isDateTimePickerVisible = false;
        this.setState(state);
    };

    _hideDateTimePickerAsync = async () => {
        let state = this.state;
        state.isDateTimePickerVisible = false;
        this.setState(state);
    };

    _showDateTimePickerAsync = async () => {
        let state = this.state;
        state.isDateTimePickerVisible = true;
        this.setState(state);
    };

    _createEventAsync = async () => {
        let state = this.state;
        let isValid = true;
        let token = await Util.getAuthToken();
        if(!state.eventName) {
            state.eventDateError = "Event Name cannot be blank.";
            isValid = false;
        }
        if(!state.eventDescription) {
            state.eventDescriptionError = "Event Description cannot be blank.";
            isValid = false;
        }
        if(!state.eventDate) {
            state.eventDateError = "You have to pick a valid event date.";
            isValid = false;
        }
        if(!state.image) {
            alert("You have to pick a cover photo for the event.");
        }
        if(isValid && token) {
            let response = await RequestHandler.addEvent(token.username, state.eventName,
                state.eventDescription, state.image.base64, state.eventDateLong,
                state.userLocation.coords.longitude,
                state.userLocation.coords.latitude);
            if(response.status === 'SUCCESS') {
                alert("Successfully added! Now, invite friends...");
                await Util.putEventProfile({
                    eventId: response.eventId
                });
                this.props.navigation.navigate('SingleEventsScreen')
            } else {
                alert("Error while trying to add event!");
            }
        }
        this.setState(state)

    };

    _returnNewEventScreen = () => {
        return (
            <Container style={{marginTop: 20}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>New Event</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this._handleMyEventsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>My Events</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._handleAllEventsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>Invitations</H2>
                    </Button>
                </Segment>
                    <View>
                        {
                            this.state.userLocation && (
                                <MapView
                                    style={{alignSelf: 'stretch', height: '20%'}}
                                    region={{
                                        latitude: this.state.userLocation.coords.latitude,
                                        longitude: this.state.userLocation.coords.longitude,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421
                                    }}
                                >
                                    <MapView.Marker
                                        coordinate={this.state.userLocation.coords}
                                        title="New Event"
                                        description="Event will be happening here! "
                                    >
                                        <Image source={icon} style={{width: 50, height: 50}}/>
                                    </MapView.Marker>
                                </MapView>
                            )
                        }
                        <Avatar xlarge center
                                source={this.state.image ? this.state.image : userImage}
                                style={{height: 175, width: '100%', alignSelf: 'center', marginTop: 5}}
                                onPress={() => this._pickImage()}
                                showEditButton/>
                        {this.state.eventNameError && (
                            <Text style={{color: 'red', paddingLeft: 5}}> {this.state.eventNameError} </Text>
                        )}
                        <Item floatingLabel>
                            <Label>Event Name</Label>
                            <Input
                                onChangeText={(text) => this._handleEventNameChangeAsync(text)}
                                value={this.state.eventName}
                            />
                        </Item>
                        {this.state.eventDescriptionError && (
                            <Text style={{color: 'red', paddingLeft: 5}}> {this.state.eventDescriptionError} </Text>
                        )}
                        <Item floatingLabel>
                            <Label>Event Description</Label>
                            <Input
                                onChangeText={(text) => this._handleEventDescriptionChangeAsync(text)}
                                value={this.state.eventDescription}
                            />
                        </Item>
                        {this.state.eventDateError && (
                            <Text style={{color: 'red', paddingLeft: 5}}> {this.state.eventDateError} </Text>
                        )}
                        {
                            this.state.eventDate && (
                                <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                                    <Icon name='clock' size={25} color="#808080"/>
                                    <H3 style={{
                                        alignSelf: 'flex-start',
                                        color: 'rgba(0,4,19,0.66)'
                                    }}> {this.state.eventDate.toDateString() + ' ' + this.state.eventDate.toTimeString()} </H3>
                                </Item>
                            )
                        }
                        <Button style={{backgroundColor: '#00ae7e', width: '30%', marginTop: 20}}
                                title="Event Date" onPress={this._showDateTimePickerAsync} >
                            <H3>Event Date</H3>
                        </Button>
                        <DateTimePicker
                            isVisible={this.state.isDateTimePickerVisible}
                            onConfirm={this._handleEventDateChangeAsync}
                            onCancel={this._hideDateTimePickerAsync}
                            mode='datetime'
                        />
                    </View>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this._createEventAsync();
                                    }}>
                                <H1>CREATE</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this.props.navigation.goBack();
                                    }}>
                                <H1>BACK</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        );
    };

    _handleMyEventsRequest = async () => {
        let state = this.state;
        let token = await Util.getAuthToken();
        let response = await RequestHandler.getMyEvents(token.username);
        if(response.status === 'SUCCESS') {
            if(response.events && response.events.length > 0) {
                state.myEvents = response.events;
                for(let i=0; i<state.myEvents.length; i++) {
                    let event = state.myEvents[i];
                    event.photo = await RequestHandler.getImageUrl(event.photoURL)
                    if(event.state === 1) {
                        event.status = "Cancelled Event";
                    }else if(event.state === 2) {
                        event.status = "CANCELLED BY ADMIN";
                    } else {
                        event.status = " New Event";
                    }                }
            } else {
                alert("Looks like you don't have any events. Create one!")
            }
        }
        console.log(response);
        this.setState(state);
    };

    _handleAllEventsRequest = async () => {
        let state = this.state;
        let token = await Util.getAuthToken();
        let response = await RequestHandler.getAllMyEvents(token.username);
        if(response.status === 'SUCCESS' && response.events && response.events.length > 0) {
            if(response.events && response.events.length > 0) {
                state.myInvites = response.events;
                for(let i=0; i<state.myInvites.length; i++) {
                    let event = state.myInvites[i];
                    event.photo = await RequestHandler.getImageUrl(event.photoURL)
                }
            } else {
                alert("Looks like you don't have any events. Create one!")
            }

        }
        console.log(response);
        this.setState(state);
    };

    _handleMyEventClickAsync = async (event) => {
        await Util.putEventProfile({
            eventId: event.eventId
        });
        this.props.navigation.navigate('SingleEventsScreen')
    };

    _handleMyEventAcceptAsync = async (event) => {
        console.log(event);
        let token = await Util.getAuthToken();
        let response = await RequestHandler.updateEvent(token.username, event.eventId, 1);
        if(response.status === 'SUCCESS') {
            alert("Event Accepted");
        } else {
            alert("Error! Cannot accept event right now.");
        }
        this._handleAllEventsRequest();
    };

    _handleMyEventRejectAsync = async (event) => {
        console.log(event);
        let token = await Util.getAuthToken();
        let response = await RequestHandler.updateEvent(token.username, event.eventId, 3);
        if(response.status === 'SUCCESS') {
            alert("Event Rejected");
        } else {
            alert("Error! Cannot reject event right now.");
        }
        this._handleAllEventsRequest();
    };

    _returnMyEventScreen = () => {
        return (
            <Container style={{marginTop: 20}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>New Event</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this._handleMyEventsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>My Events</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._handleAllEventsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>Invitations</H2>
                    </Button>
                </Segment>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoading}
                            onRefresh={() => this._loadScreenParams()}
                        />
                    }
                >
                    <View>
                        {
                            this.state.myEvents && this.state.myEvents.map((event) => (
                                <ListItem icon key={event.eventId} style = {{paddingTop: 10}}>
                                    <Left>
                                        <Thumbnail style={{width: 30, height: 30}}
                                                   source={{uri: event.photo}}/>
                                    </Left>
                                    <Body>
                                        <Text>{event.eventName}</Text>
                                        <Text  style={{fontSize: 10, color: 'gray'}}>{event.status}</Text>
                                    </Body>
                                    <Right>
                                        <Button style={{backgroundColor: "#0002c6"}}
                                                onPress={() => this._handleMyEventClickAsync(event)}>
                                            <Icon active name="arrow-forward"/>
                                        </Button>
                                    </Right>
                                </ListItem>
                            ))
                        }
                    </View>
                </ScrollView>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this.props.navigation.goBack();
                                    }}>
                                <H1>BACK</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        );
    };

    _returnAllMyEventScreen = () => {
        return (
            <Container style={{marginTop: 20}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>New Event</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this._handleMyEventsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>Created By Me</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._handleAllEventsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>All Events</H2>
                    </Button>
                </Segment>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoading}
                            onRefresh={() => this._loadScreenParams()}
                        />
                    }
                >
                    <View>
                        {
                            this.state.myInvites && this.state.myInvites.map((event) => (
                                <ListItem icon key={event.eventId} style = {{paddingTop: 10}}>
                                    <Left>
                                        <Thumbnail style={{width: 30, height: 30}}
                                                   source={{uri: event.photo}}/>
                                    </Left>
                                    <Body>
                                        <Text>{event.eventName}</Text>
                                    </Body>
                                    <Right>
                                        {
                                            event.state === 0 && (
                                                <Button style={{backgroundColor: "#04c600", marginLeft: 15}}
                                                        onPress={() => this._handleMyEventAcceptAsync(event)}>
                                                    <Icon active name="checkmark"/>
                                                </Button>
                                            )

                                        }
                                        {
                                            (event.state === 0 || event.state === 1) && (
                                                <Button style={{backgroundColor: "#c6000b"}}
                                                        onPress={() => this._handleMyEventRejectAsync(event)}>
                                                    <Icon active name="close"/>
                                                </Button>
                                            )

                                        }
                                    </Right>
                                </ListItem>
                            ))
                        }
                    </View>
                </ScrollView>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this.props.navigation.goBack();
                                    }}>
                                <H1>BACK</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        );
    };

    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            base64: true,
        });
        let state = this.state;
        if (result.cancelled) {
            state.image = undefined;
        } else {
            state.image = result;

        }
        this.setState(state);
        console.log(state.image);
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        backgroundColor: '#ecf0f1',
    },
    titleIcon: {
        resizeMode: 'center',
        width: 600,
        height: 400,
        marginTop: 20,
        marginBottom: 20,
        alignSelf: 'center',
        borderRadius: 150 / 6,
    },
    textStyle: {
        alignSelf: 'center'
    }
});
