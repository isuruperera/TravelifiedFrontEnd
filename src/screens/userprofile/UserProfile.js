import React, {Component} from 'react';
import {Button, Container, Content, H1, H3, Spinner, View, Icon, Item} from 'native-base';

import Util from '../../util/Util';
import {Dimensions, Image, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import Svg, {Circle, Line, Polygon, Text} from 'react-native-svg';
import RequestHandler from '../../util/RESTRequestHandler'


const config = require('../../config/config.json');


export default class FloatingLabelExample extends Component {


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
            isLoading: true,
        }
    }

    componentDidMount() {
        this._loadScreenParams();
    }

    async _loadScreenParams() {
        let screenParams = await Util.getUserProfileParams();
        console.log(screenParams);
        let state = this.state;
        if (screenParams.myProfile) {
            let token = await Util.getAuthToken();
            let userProfile = await RequestHandler.sendUserProfileRequest(token.username);
            if (userProfile.status === 'SUCCESS') {
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

        this.state.isLoading = false;
        console.log(state);
        this.setState(state);
        //this.forceUpdate();
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
        console.log(this.state.userImageURL);
        return (
            <Container style={{marginTop: 20}}>
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
                            {this.state.ratingsProfile1 && (
                                <Polygon
                                    points={this.state.ratingsProfile1.ratingsPolygon}
                                    fill='rgba(55,204,19,0.69)'
                                    stroke="purple"
                                    strokeWidth="1"
                                />
                            )
                            }
                            {this.state.ratingsProfile1 && this.state.ratingsProfile1.ratingsSupportLines.map((rating, index) => {
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
                            {this.state.ratingsProfile1 && this.state.ratingsProfile1.ratingsSupportLines.map((rating, index) => {
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
                            this.props.navigation.navigate('NavScreen1')
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
    }


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
        width: 200,
        height: 200,
        marginTop: 20,
        marginBottom: 20,
        alignSelf: 'center',
        borderRadius: 150 / 3,
    },
    textStyle: {
        alignSelf: 'center'
    }
});
