import React, {Component} from 'react';

import Util from '../../util/Util';
import {Dimensions, StyleSheet} from 'react-native';
import RequestHandler from '../../util/RESTRequestHandler';
import {
    Body,
    Button,
    Card,
    CardItem,
    Container,
    Content,
    Form,
    H1,
    H2,
    H3,
    Icon,
    Item,
    Left,
    Segment,
    Spinner,
    Text,
    Textarea, Right,
    Thumbnail, ListItem
} from 'native-base';

const userImage = require("../../../assets/images/travelified-logo.png");
const config = require('../../config/config.json');


export default class Friends extends Component {


    constructor(props) {
        super(props);
        this.state = {
            service: undefined,
            screen: 1,
            friendsList: [],
            isLoading: true,
            tab1Color: '#9195ae',
            tab2Color: '#00ae7e',
            tab3Color: '#00ae7e'
        }
    }

    componentDidMount() {
        this._loadScreenParams();
    }

    async _loadScreenParams() {
        let state = this.state;
        let token = await Util.getAuthToken();
        let response = await RequestHandler.getAllMyFriends(token.username);
        console.log(response);
        if (response.status === 'SUCCESS') {
            state.friendsList = response.userFriendList;
            for (let i = 0; i < state.friendsList.length; i++) {
                let friend = state.friendsList[i];
                friend.photo = await RequestHandler.getImageUrl(friend.imageID);
            }
        }
        state.isLoading = false;
        this.setState(state);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Container
                    style={{alignItems: 'center', alignSelf: 'center', marginTop: Dimensions.get('window').height / 2}}>
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
            return this._returnMainScreen();
        } else if (this.state.screen === 2) {
            return this._returnMainScreen();
        } else {
            return this._returnMainScreen();
        }
    }

    _goToFriendProfile = async (friend) => {
        await Util.putFriendProfileParams({
            friendProfile: true,
            username: friend.username
        });
        this.props.navigation.navigate('FriendProfileScreen')
    };

    _returnMainScreen = () => {
        return (
            <Container style={{marginTop: 20}}>
                {
                    this.state.friendsList && this.state.friendsList.map((friend) => (
                        <ListItem icon key={friend.username} style={{paddingTop: 10}}>
                            <Left>
                                <Thumbnail style={{width: 30, height: 30}}
                                           source={{uri: friend.photo}}/>
                            </Left>
                            <Body>
                                <Text>{friend.fullname}</Text>
                            </Body>
                            <Right>
                                <Button style={{backgroundColor: "#00c612"}}
                                        onPress={() => this._goToFriendProfile(friend)}>
                                    <Icon active name="add"/>
                                </Button>
                            </Right>
                        </ListItem>
                    ))
                }
                <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                        onPress={() => {
                            this.props.navigation.navigate('NavScreen1')
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
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
