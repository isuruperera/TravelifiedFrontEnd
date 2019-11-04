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
    Icon,
    Left,
    ListItem,
    Right,
    Segment,
    Spinner,
    Text,
    Thumbnail,
    View
} from 'native-base';
import {Dimensions, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import RequestHandler from '../../util/RESTRequestHandler';
import bgImgStyle from "../register/styles";
import Util from "../../util/Util";
import * as ImagePicker from 'expo-image-picker';

const icon = require('../../../assets/images/event.png');


const userImage = require("../../../assets/images/travelified-logo.png");
const config = require('../../config/config.json');


export default class AdminScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            screen: 1,
            eventInvitees: [],
            isLoading: true,
            users: [],
            events: [],
            services: [],
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

    async _loadUsers() {
        let state = this.state;
        let token = await Util.getAuthToken();
        if (token.id && token.adminToken) {
            let response = await RequestHandler.getAllUsers(token.adminToken, token.id, token.username);
            console.log("response USR");
            console.log(response);
            if (response.status === 'SUCCESS') {
                state.users = response.list;
                for (let i = 0; i < state.users.length; i++) {
                    let usr = state.users[i];
                    usr.photo = await RequestHandler.getImageUrl(usr.imageID)
                }
            } else {
                alert("Cannot load users. Are you admin?")
            }
        } else {
            alert("This user is not an admin.")
        }
        state.isLoading = false;
        this.setState(state);
    }

    async _loadEvents() {
        let state = this.state;
        let token = await Util.getAuthToken();
        if (token.id && token.adminToken) {
            let response = await RequestHandler.getAllEvents(token.adminToken, token.id, token.username);
            console.log("response EVT");
            console.log(response);
            if (response.status === 'SUCCESS') {
                state.events = response.list;
                for (let i = 0; i < state.events.length; i++) {
                    let evt = state.events[i];
                    evt.photo = await RequestHandler.getImageUrl(evt.imageID)
                }
            } else {
                alert("Cannot load users. Are you admin?")
            }
        } else {
            alert("This user is not an admin.")
        }
        state.isLoading = false;
        this.setState(state);
    }

    async _loadServices() {
        let state = this.state;
        let token = await Util.getAuthToken();
        if (token.id && token.adminToken) {
            let response = await RequestHandler.getAllServices(token.adminToken, token.id, token.username);
            console.log("response EVT");
            console.log(response);
            if (response.status === 'SUCCESS') {
                state.services = response.list;
                for (let i = 0; i < state.services.length; i++) {
                    let svc = state.services[i];
                    svc.photo = await RequestHandler.getImageUrl(svc.imageID)
                }
            } else {
                alert("Cannot load services. Are you admin?")
            }
        } else {
            alert("This user is not an admin.")
        }
        state.isLoading = false;
        this.setState(state);
    }

    async _loadScreenParams() {
        await this._loadUsers();
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
            return this._returnAllUsersScreen();
        } else if (this.state.screen === 2) {
            return this._returnAllServicesScreen();
        } else if (this.state.screen === 3) {
            return this._returnAllEventsScreen();
        } else {
            return this._returnAllUsersScreen();
        }
    }

    _handleGetAllUsersAsync = async (name) => {
        let state = this.state;
        state.eventName = name;
        state.eventNameError = undefined;
        this.setState(state);
    };

    _returnAllUsersScreen = () => {
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
                        <H2 style={{marginLeft: 5}}>Block Users</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this._loadServices();
                            }}>
                        <H2 style={{marginLeft: 5}}>Block Services</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._loadEvents()
                            }}>
                        <H2 style={{marginLeft: 5}}>Block Events</H2>
                    </Button>
                </Segment>
                <ScrollView>
                    {
                        this.state.users.length > 0 && this.state.users.map((user) => (
                            <ListItem icon key={user.username} style={{paddingTop: 10, marginTop: 10}}>
                                <Left>
                                    <Thumbnail style={{width: 30, height: 30}}
                                               source={{uri: user.photo}}/>
                                </Left>
                                <Body>
                                    <Text>{user.fullname}</Text>
                                </Body>
                                <Right>
                                    {
                                        user.userStatus === 0 && (
                                            <Button style={{backgroundColor: "#04c600", marginLeft: 15}}
                                                    onPress={() => this._havdleUserUpdate(user, 1)}>
                                                <Icon active name="checkmark"/>
                                            </Button>
                                        )

                                    }
                                    {
                                        user.userStatus === 1 && (
                                            <Button style={{backgroundColor: "#c6000b"}}
                                                    onPress={() => this._havdleUserUpdate(user, 0)}>
                                                <Icon active name="close"/>
                                            </Button>
                                        )

                                    }
                                </Right>
                            </ListItem>
                        ))
                    }

                </ScrollView>
            </Container>
        );
    };

    _returnAllEventsScreen = () => {
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
                        <H2 style={{marginLeft: 5}}>Block Users</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this._loadServices();
                            }}>
                        <H2 style={{marginLeft: 5}}>Block Services</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._loadEvents()
                            }}>
                        <H2 style={{marginLeft: 5}}>Block Events</H2>
                    </Button>
                </Segment>

                <ScrollView>
                    {
                        this.state.events.length > 0 && this.state.events.map((event) => (
                            <ListItem icon key={event.eventId} style={{paddingTop: 10, marginTop: 10}}>
                                <Left>
                                    <Thumbnail style={{width: 30, height: 30}}
                                               source={{uri: event.photo}}/>
                                </Left>
                                <Body>
                                    <Text>{event.eventName}</Text>
                                </Body>
                                <Right>
                                    {
                                        event.eventStatus === 0 && (
                                            <Button style={{backgroundColor: "#04c600", marginLeft: 15}}
                                                    onPress={() => this._havdleEventUpdate(event, 1)}>
                                                <Icon active name="checkmark"/>
                                            </Button>
                                        )

                                    }
                                    {
                                        event.eventStatus === 1 && (
                                            <Button style={{backgroundColor: "#c6000b"}}
                                                    onPress={() => this._havdleEventUpdate(event, 0)}>
                                                <Icon active name="close"/>
                                            </Button>
                                        )

                                    }
                                </Right>
                            </ListItem>
                        ))
                    }

                </ScrollView>
            </Container>
        );
    };

    _returnAllServicesScreen = () => {
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
                        <H2 style={{marginLeft: 5}}>Block Users</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this._loadServices();
                            }}>
                        <H2 style={{marginLeft: 5}}>Block Services</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._loadEvents()
                            }}>
                        <H2 style={{marginLeft: 5}}>Block Events</H2>
                    </Button>
                </Segment>
                <ScrollView>
                    {
                        this.state.services.length > 0 && this.state.services.map((service) => (
                            <ListItem icon key={service.serviceId} style={{paddingTop: 10, marginTop: 10}}>
                                <Left>
                                    <Thumbnail style={{width: 30, height: 30}}
                                               source={{uri: service.photo}}/>
                                </Left>
                                <Body>
                                    <Text>{service.serviceName}</Text>
                                </Body>
                                <Right>
                                    {
                                        service.serviceStatus === 0 && (
                                            <Button style={{backgroundColor: "#04c600", marginLeft: 15}}
                                                    onPress={() => this._havdleServiceUpdate(service, 1)}>
                                                <Icon active name="checkmark"/>
                                            </Button>
                                        )

                                    }
                                    {
                                        service.serviceStatus === 1 && (
                                            <Button style={{backgroundColor: "#c6000b"}}
                                                    onPress={() => this._havdleServiceUpdate(service, 0)}>
                                                <Icon active name="close"/>
                                            </Button>
                                        )

                                    }
                                </Right>
                            </ListItem>
                        ))
                    }
                </ScrollView>
            </Container>
        );
    };

    _havdleUserUpdate = async (user, update) => {
        let token = await Util.getAuthToken();
        if (token.id && token.adminToken) {
            let response = await RequestHandler.updateUserAdmin(token.adminToken, token.id, token.username, user.username, update);
            console.log("response UU EVT");
            console.log(response);
            if (response.status === 'SUCCESS') {
                alert("Successfully blocked the user!")
            } else {
                alert("Cannot load users. Are you admin?")
            }
        } else {
            alert("This user is not an admin.")
        }
        this._loadUsers();
    };

    _havdleEventUpdate = async (event, update) => {
        let token = await Util.getAuthToken();
        if (token.id && token.adminToken) {
            let response = await RequestHandler.updateEventAdmin(token.adminToken, token.id, token.username, event.eventId, update);
            console.log("response UE EVT");
            console.log(response);
            if (response.status === 'SUCCESS') {
                alert("Successfully blocked the event!")
            } else {
                alert("Cannot load users. Are you admin?")
            }
        } else {
            alert("This user is not an admin.")
        }
        this._loadEvents();
    };

    _havdleServiceUpdate = async (service, update) => {
        let token = await Util.getAuthToken();
        if (token.id && token.adminToken) {
            let response = await RequestHandler.updateServiceAdmin(token.adminToken, token.id, token.username, service.serviceId, update);
            console.log("response US EVT");
            console.log(response);
            if (response.status === 'SUCCESS') {
                alert("Successfully blocked the service!")
            } else {
                alert("Cannot load users. Are you admin?")
            }
        } else {
            alert("This user is not an admin.")
        }
        this._loadServices();
    };

    _handleMyEventsRequest = async () => {
        let state = this.state;
        let token = await Util.getAuthToken();
        let response = await RequestHandler.getMyEvents(token.username);
        if (response.status === 'SUCCESS') {
            if (response.events && response.events.length > 0) {
                state.myEvents = response.events;
                for (let i = 0; i < state.myEvents.length; i++) {
                    let event = state.myEvents[i];
                    event.photo = await RequestHandler.getImageUrl(event.photoURL)
                    if (event.state === 1) {
                        event.status = "Cancelled Event";
                    } else if (event.state === 2) {
                        event.status = "CANCELLED BY ADMIN";
                    } else {
                        event.status = " New Event";
                    }
                }
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
        if (response.status === 'SUCCESS' && response.events && response.events.length > 0) {
            if (response.events && response.events.length > 0) {
                state.myInvites = response.events;
                for (let i = 0; i < state.myInvites.length; i++) {
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
        if (response.status === 'SUCCESS') {
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
        if (response.status === 'SUCCESS') {
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
                                <ListItem icon key={event.eventId} style={{paddingTop: 10}}>
                                    <Left>
                                        <Thumbnail style={{width: 30, height: 30}}
                                                   source={{uri: event.photo}}/>
                                    </Left>
                                    <Body>
                                        <Text>{event.eventName}</Text>
                                        <Text style={{fontSize: 10, color: 'gray'}}>{event.status}</Text>
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
                                <ListItem icon key={event.eventId} style={{paddingTop: 10}}>
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
