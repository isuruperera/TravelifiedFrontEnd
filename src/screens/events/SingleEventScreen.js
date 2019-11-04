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
import { Permissions, Notifications } from 'expo';

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
            eventParticipable: undefined,
            isLoading: true,
            eventName: undefined,
            eventDescription: undefined,
            eventDate: undefined,
            image: undefined,
            isDateTimePickerVisible: false,
            reminderDate: false,
            eventId: undefined,
            userId: undefined,
            eventState: 'N/A',
            state: undefined,
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
        let screenParams = await Util.getEventProfileParams();
        console.log(token);
        let eventResponse = await RequestHandler.getEvent(screenParams.eventId, token.username);
        console.log(eventResponse);
        if(eventResponse.status === 'SUCCESS') {
            state.eventName = eventResponse.eventName;
            state.eventDescription = eventResponse.description;
            state.userLocation = {
                longitude: eventResponse.longitude,
                latitude: eventResponse.latitude
            };
            state.image = await RequestHandler.getImageUrl(eventResponse.photoURL);
            state.eventDate = new Date(eventResponse.eventDate);
            state.eventInvitees = eventResponse.eventParticipants;
            state.eventId = screenParams.eventId;
            state.userId = token.username;
            if(eventResponse.state === 0) {
                state.eventState = "Not Responded Yet"
            } else if(eventResponse.state === 1) {
                state.eventState = "Accepted"
            } else if(eventResponse.state === 3) {
                state.eventState = "Rejected"
            }else if(eventResponse.state === 2) {
                state.eventState = "Created By Me"
            }
             state.state = eventResponse.state;
            state.isLoading = false;
        } else {
            alert("Something went wrong during event data requesting!");
            this.props.navigation.goBack();
        }
        this.setState(state);

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
            return this._returnEventMainScreen();
        } else if (this.state.screen === 2) {
            return this._returnEventInviteScreen();
        } else {
            return this._returnEventMainScreen();
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
        state.reminderDate = date;
        state.isDateTimePickerVisible = false;

        let localNotification = {
            title: state.eventName,
            body: "Reminder! you have an upcoming event!"
        };

        let schedulingOptions = {
            time: state.reminderDate.getTime()
        };

        Notifications.scheduleLocalNotificationAsync(localNotification, schedulingOptions);

        alert("Reminder added!");
        this.setState(state);
    };

    _handleAddReminderAsync = async () => {

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

    _handleMyEventAcceptAsync = async () => {
        console.log("event");
        let token = await Util.getAuthToken();
        let response = await RequestHandler.updateEvent(token.username, this.state.eventId, 1);
        if(response.status === 'SUCCESS') {
            alert("Event Accepted");
        } else {
            alert("Error! Cannot accept event right now.");
        }
        this._loadScreenParams();
    };

    _handleMyEventRejectAsync = async () => {
        console.log("event");
        let token = await Util.getAuthToken();
        let response = await RequestHandler.updateEvent(token.username, this.state.eventId, 3);
        if(response.status === 'SUCCESS') {
            alert("Event Accepted");
        } else {
            alert("Error! Cannot accept event right now.");
        }
        this._loadScreenParams();
    };

    _sendInvitableFriendsRequest = async () => {
        let state = this.state;
        let response = await RequestHandler.getInvitableFriends(state.eventId, state.userId);
        if(response.status === 'SUCCESS') {
            state.eventParticipable = response.eventParticipants;
            for(let i=0; i<state.eventParticipable.length; i++) {
                let particip = state.eventParticipable[i];
                particip.photo = await RequestHandler.getImageUrl(particip.imageID)
            }
        } else {
            alert("Error! cannot find invitable friends!")
        }
        console.log(response);
        this.setState(state);
    };

    _handleInviteAsync = async (participant) => {
        let state = this.state;
        let response = await RequestHandler.inviteFriend(state.eventId, participant.username);
        if(response.status === 'SUCCESS') {
            let newList = [];
            for(let i=0; i<state.eventParticipable.length; i++) {
                let particip = state.eventParticipable[i];
                if(particip.username !== participant.username) {
                    newList.push(particip);
                }
            }
            state.eventParticipable = newList;
            if(state.eventParticipable.length === 0) {
                alert("Looks like all your friends are already invited!")
            }
        } else {
            alert("Error! cannot add this friend!")
        }
        this.setState(state);
    };


    _returnEventMainScreen = () => {
        return (
            <Container style={{marginTop: 20}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '50%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Event</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '50%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this._sendInvitableFriendsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>Invite</H2>
                    </Button>
                </Segment>
                <View>
                    {
                        this.state.userLocation && (
                            <MapView
                                style={{alignSelf: 'stretch', height: '30%'}}
                                region={{
                                    latitude: this.state.userLocation.latitude,
                                    longitude: this.state.userLocation.longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421
                                }}
                            >
                                <MapView.Marker
                                    coordinate={this.state.userLocation}
                                    title="New Event"
                                    description="Event will be happening here! "
                                >
                                    <Image source={icon} style={{width: 50, height: 50}}/>
                                </MapView.Marker>
                            </MapView>
                        )
                    }
                    { this.state.image && (
                        <Image
                            source={{uri: this.state.image}}
                            style={{height: 200, width: '100%', alignSelf: 'center', marginTop: 5}}
                        />
                    )
                    }
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name='calendar' size={25} color="#808080"/>
                        <H3 style={{
                            alignSelf: 'flex-start',
                            color: 'rgba(0,4,19,0.66)'
                        }}> {this.state.eventName} </H3>
                    </Item>
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name='text' size={25} color="#808080"/>
                        <H3 style={{
                            alignSelf: 'flex-start',
                            color: 'rgba(0,4,19,0.66)'
                        }}> {this.state.eventDescription} </H3>
                    </Item>
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name='clock' size={25} color="#808080"/>
                        <H3 style={{
                            alignSelf: 'flex-start',
                            color: 'rgba(0,4,19,0.66)'
                        }}> {this.state.eventDate.toDateString() + ' ' + this.state.eventDate.toTimeString()} </H3>
                    </Item>
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name='thumbs-up' size={25} color="#808080"/>
                        <H3 style={{
                            alignSelf: 'flex-start',
                            color: 'rgba(0,4,19,0.66)'
                        }}> {this.state.eventState} </H3>
                    </Item>
                    <Right>
                        {
                            this.state.state === 0 && (
                                <Button style={{backgroundColor: "#04c600", marginLeft: 15}}
                                        onPress={() => this._handleMyEventAcceptAsync()}>
                                    <Icon active name="checkmark"/>
                                </Button>
                            )

                        }
                        {
                            (this.state.state === 0 || this.state.state === 1) && (
                                <Button style={{backgroundColor: "#c6000b"}}
                                        onPress={() => this._handleMyEventRejectAsync()}>
                                    <Icon active name="close"/>
                                </Button>
                            )

                        }
                    </Right>
                    <DateTimePicker
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={this._handleEventDateChangeAsync}
                        onCancel={this._hideDateTimePickerAsync}
                        date={this.state.eventDate}
                        mode='datetime'
                    />

                </View>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this._showDateTimePickerAsync();
                                    }}>
                                <H1>ADD REMINDER</H1>
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

    _returnEventInviteScreen = () => {
        return (
            <Container style={{marginTop: 20}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '50%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Event</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '50%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this._sendInvitableFriendsRequest();
                            }}>
                        <H2 style={{marginLeft: 5}}>Invite</H2>
                    </Button>
                </Segment>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoading}
                            onRefresh={() => this._sendInvitableFriendsRequest()}
                        />
                    }
                >
                    <View>
                        {
                            this.state.eventParticipable && this.state.eventParticipable.map((participant) => (
                                <ListItem icon key={participant.username} style = {{paddingTop: 10}}>
                                    <Left>
                                        <Thumbnail style={{width: 30, height: 30}}
                                                   source={{uri: participant.photo}}/>
                                    </Left>
                                    <Body>
                                        <Text>{participant.fullname}</Text>
                                    </Body>
                                    <Right>
                                        <Button style={{backgroundColor: "#00c612"}}
                                                onPress={() => this._handleInviteAsync(participant)}>
                                            <Icon active name="add"/>
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
