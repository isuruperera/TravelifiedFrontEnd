import React, {Component} from 'react';
import {Button, Container, Content, H1, H2, H3, Spinner, View, Icon, Item, Segment} from 'native-base';

import Util from '../../util/Util';
import {Dimensions, Image, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import Svg, {Circle, Line, Polygon, Text} from 'react-native-svg';
import RequestHandler from '../../util/RESTRequestHandler'
import {AirbnbRating, Rating} from 'react-native-ratings';

const config = require('../../config/config.json');


export default class FriendProfile extends Component {


    constructor(props) {
        super(props);
        this.state = {
            profileType: undefined,
            ratingsProfile1: undefined,
            userProfile: undefined,
            ratingsProfile2: undefined,
            windowWidth: Dimensions.get('window').width,
            windowHeight: Dimensions.get('window').height,
            center: {x: ((Dimensions.get('window').width) / 2), y: ((Dimensions.get('window').height) / 2) - 250},
            sampleRatings: undefined,
            sampleRatings2: undefined,
            screen: 1,
            adventureRating: 5,
            entertainerRating: 5,
            friendInNeedRating: 5,
            masterChef: 5,
            animalLover: 5,
            friendName: undefined,
            isLoading: true,
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
        let screenParams = await Util.getFriendProfileParams();
        console.log("screenParams");
        console.log(screenParams);
        let state = this.state;
        if (screenParams.friendProfile) {
            let userProfile = await RequestHandler.sendUserProfileRequest(screenParams.username);
            if (userProfile.status === 'SUCCESS') {
                state.friendName = screenParams.username;
                console.log(userProfile);
                let ratingsList = userProfile.userRatings;
                state.userProfile = userProfile.user;
                state.userImageURL = RequestHandler.getImageUrl(userProfile.user.imageID);
                console.log("Ratings List: ");
                console.log(ratingsList);
                console.log("Curr State: ");
                console.log("Curr State:   ");
                console.log(state);
                state.ratingsProfile1 = {
                    ratingsSupportLines: [],
                    ratingsPolygon: ""
                };
                let lineLength = state.windowWidth / 3;
                for (let i = 0; i < ratingsList.length; i++) {
                    let rating = {
                        category: ratingsList[i].category,
                        rating: ratingsList[i].rating,
                        ex: lineLength * Math.cos((i * 2 * Math.PI / (ratingsList.length))) + state.center.x,
                        ey: lineLength * Math.sin((i * 2 * Math.PI / (ratingsList.length))) + state.center.y,
                        rx: lineLength * (ratingsList[i].rating / 5) * Math.cos((i * 2 * Math.PI / (ratingsList.length))) + state.center.x,
                        ry: lineLength * (ratingsList[i].rating / 5) * Math.sin((i * 2 * Math.PI / (ratingsList.length))) + state.center.y
                    };
                    state.ratingsProfile1.ratingsSupportLines.push(rating);
                }
                for (let i = 0; i < state.ratingsProfile1.ratingsSupportLines.length; i++) {
                    state.ratingsProfile1.ratingsPolygon = state.ratingsProfile1.ratingsPolygon
                        + state.ratingsProfile1.ratingsSupportLines[i].rx
                        + "," + state.ratingsProfile1.ratingsSupportLines[i].ry + " "
                }
                state.ratingsProfile1.ratingsPolygon.trimRight();
            }

            console.log(state.ratingsProfile1.ratingsPolygon);
        }

        state.isLoading = false;
        console.log(state);
        this.setState(state);
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Container style={{alignItems: 'center', alignSelf: 'center', marginTop: Dimensions.get('window').height/2}}>
                    <Content>
                        <Spinner color='blue'/>
                    </Content>
                </Container>
            );

        }
        console.log("Rendering State H1");
        console.log(this.state);
        if (this.state.screen === 1) {
            return this._returnMainScreen();
        } else if (this.state.screen === 2) {
            return this._returRatingsScreen();
        } else {
            return this._returnMainScreen();
        }

    }

    _returnMainScreen = () => {
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
                        <H2 style={{marginLeft: 5}}>Profile</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '50%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Rate</H2>
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
                    {this.state.userProfile.firstName && this.state.userProfile.lastName && (
                        <H1 style = {{alignSelf: 'center', color: 'rgba(0,4,26,0.96)'}}> {this.state.userProfile.firstName + ' ' + this.state.userProfile.lastName} </H1>
                    )}
                    {this.state.userProfile.country && (
                        <H3 style = {{alignSelf: 'center', color: 'rgba(0,4,19,0.66)'}}> {this.state.userProfile.country} </H3>
                    )}
                    {this.state.userImageURL && (
                        <Image
                            source={{uri: this.state.userImageURL}}
                            style={styles.profileIcon}
                        />
                    )}
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name= 'call' size={25} color="#808080"/>
                        <H3 style = {{alignSelf: 'flex-start', color: 'rgba(0,4,19,0.66)'}}> {this.state.userProfile.phone} </H3>
                    </Item>
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name= 'mail' size={25} color="#808080"/>
                        <H3 style = {{alignSelf: 'flex-start', color: 'rgba(0,4,19,0.66)'}}> {this.state.userProfile.email} </H3>
                    </Item>
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 25, marginBottom: 10}}>
                        <H3 style = {{alignSelf: 'flex-start', color: 'rgba(0,4,19,0.66)'}}> Ratings Profile </H3>
                    </Item>
                    { this.state.ratingsProfile1.ratingsPolygon === "" && (
                        <Item style={{marginRight: 10, marginLeft: 20, marginTop: 25, marginBottom: 10}}>
                            <H3 style = {{alignSelf: 'flex-start', color: 'red'}}> Nobody has rated this user yet!</H3>
                        </Item>
                    )

                    }
                    <Item>
                        <Svg style={{backgroundColor: 'rgba(0,4,19,0.21)'}}
                             height={300}
                             width={this.state.windowWidth}
                        >
                            {this.state.center && (
                                <Circle
                                    cx={this.state.center.x}
                                    cy={this.state.center.y}
                                    r={10}
                                    fill="black"
                                />
                            )}
                            {this.state.ratingsProfile1 && this.state.ratingsProfile1.ratingsPolygon !== '' && (
                                <Polygon
                                    points={this.state.ratingsProfile1.ratingsPolygon}
                                    fill='rgba(55,204,19,0.69)'
                                    stroke="purple"
                                    strokeWidth="1"
                                />
                            )
                            }
                            {this.state.ratingsProfile1 && this.state.ratingsProfile1.ratingsSupportLines.length > 0 && this.state.ratingsProfile1.ratingsSupportLines.map((rating, index) => {
                                return (
                                    <Line
                                        x1={this.state.center.x}
                                        y1={this.state.center.y}
                                        x2={rating.ex}
                                        y2={rating.ey}
                                        stroke="black"
                                        strokeWidth="1"
                                        key={index}
                                    />
                                )
                            })
                            }
                            {this.state.ratingsProfile1 && this.state.ratingsProfile1.ratingsSupportLines.length > 0
                            && this.state.ratingsProfile1.ratingsSupportLines.map((rating, index) => {
                                return (
                                    <Text
                                        x={rating.rx}
                                        y={rating.ry}
                                        fontSize="15"
                                        fontWeight="bold"
                                        key={index}
                                    > {rating.category + ": " + rating.rating} </Text>
                                )
                            })
                            }
                        </Svg>
                    </Item>
                </ScrollView>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
    };

    _handleAdventureCompleted = async (rating) => {
        console.log("Rating is: " + rating);
        let state = this.state;
        if (rating) {
            state.adventureRating = rating;
        }
        console.log(state);
        this.setState(state);
    };

    _handleEntertainerCompleted = async (rating) => {
        console.log("Rating is: " + rating);
        let state = this.state;
        if (rating) {
            state.entertainerRating = rating;
        }
        console.log(state);
        this.setState(state);
    };

    _handleFriendCompleted = async (rating) => {
        console.log("Rating is: " + rating);
        let state = this.state;
        if (rating) {
            state.friendInNeedRating = rating;
        }
        console.log(state);
        this.setState(state);
    };

    _handleMasterChefCompleted = async (rating) => {
        console.log("Rating is: " + rating);
        let state = this.state;
        if (rating) {
            state.masterChef = rating;
        }
        console.log(state);
        this.setState(state);
    };

    _handleAnimalLoverCompleted = async (rating) => {
        console.log("Rating is: " + rating);
        let state = this.state;
        if (rating) {
            state.animalLover = rating;
        }
        console.log(state);
        this.setState(state);
    };

    _returRatingsScreen = () => {
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
                        <H2 style={{marginLeft: 5}}>Profile</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '50%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Rate</H2>
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
                    <H3 style = {{alignSelf: 'center', color: 'rgba(0,4,19,0.66)', marginTop: 15}}> Adventurer </H3>
                    <AirbnbRating
                        count={5}
                        reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                        defaultRating={5}
                        size={30}
                        onFinishRating={this._handleAdventureCompleted}
                    />
                    <H3 style = {{alignSelf: 'center', color: 'rgba(0,4,19,0.66)'}}> Entertainer </H3>
                    <AirbnbRating
                        count={5}
                        reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                        defaultRating={5}
                        size={30}
                        onFinishRating={this._handleEntertainerCompleted}
                    />
                    <H3 style = {{alignSelf: 'center', color: 'rgba(0,4,19,0.66)'}}> Friend In Need </H3>
                    <AirbnbRating
                        count={5}
                        reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                        defaultRating={5}
                        size={30}
                        onFinishRating={this._handleFriendCompleted}
                    />
                    <H3 style = {{alignSelf: 'center', color: 'rgba(0,4,19,0.66)'}}> Master Chef </H3>
                    <AirbnbRating
                        count={5}
                        reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                        defaultRating={5}
                        size={30}
                        onFinishRating={this._handleMasterChefCompleted}
                    />
                    <H3 style = {{alignSelf: 'center', color: 'rgba(0,4,19,0.66)'}}> Animal Lover </H3>
                    <AirbnbRating
                        count={5}
                        reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                        defaultRating={5}
                        size={30}
                        onFinishRating={this._handleAnimalLoverCompleted}
                    />
                </ScrollView>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%', marginBottom: 5}}
                        onPress={() => {
                            this._addRating();
                        }}>
                    <H1>RATE</H1>
                </Button>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
    };
    _addRating = async () => {
        let state = this.state;
        let token = await Util.getAuthToken();
        let response = await RequestHandler.addUserRating(
            token.username,
            state.friendName,
            state.adventureRating,
            state.entertainerRating,
            state.friendInNeedRating,
            state.masterChef,
            state.animalLover
        );
        if(response.status === 'SUCCESS') {
            alert("Successfully added the rating!");
        } else {
            alert("Failed to add rating");
        }
        this._loadScreenParams();
    };


    async _handleSaveAsync() {
        console.log("Save Button Pressed! ");
        let request = {};
        request.username = "test";
        request.text = this.testValue;

        let response = await fetch(config.backEndURL + 'test/save_text', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        console.log(response);

    }

    async _handleSaveAsync2() {
        console.log("Save Button Pressed! 2!");

    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        backgroundColor: '#ecf0f1',
    },
    profileIcon: {
        resizeMode: 'center',
        width: 110,
        height: 110,
        marginTop: 20,
        marginBottom: 20,
        alignSelf: 'center',
        borderRadius: 150 / 3,
    },
    textStyle: {
        alignSelf: 'center'
    }
});
