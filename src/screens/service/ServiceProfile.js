import React, {Component} from 'react';
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
    Textarea,
    Thumbnail
} from 'native-base';

import Util from '../../util/Util';
import {Dimensions, Image, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import RequestHandler from '../../util/RESTRequestHandler';
import {AirbnbRating, Rating} from 'react-native-ratings';
import * as ImagePicker from 'expo-image-picker';
import {Avatar} from 'react-native-elements';

const userImage = require("../../../assets/images/travelified-logo.png");
const config = require('../../config/config.json');


export default class ServiceProfile extends Component {


    constructor(props) {
        super(props);
        this.state = {
            service: undefined,
            screen: 1,
            rating: 5,
            comment: '',
            isLoading: true,
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
        let screenParams = await Util.getServiceProfileParams();
        console.log(screenParams);
        let state = this.state;
        if (screenParams) {
            state.service = screenParams;
            state.service.titleURL = await RequestHandler.getImageUrl(screenParams.titlePhoto)
        }
        this.state.isLoading = false;
        console.log(state);
        this.setState(state);
        if(this.state.screen === 3) {
            this._sendAllCommentsRetrieveRequest();
        }
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
            return this._returnOverviewScreen();
        } else if (this.state.screen === 2) {
            return this._returnAddReviewScreen();
        } else {
            return this._returnAllReviewsScreen();
        }
    }

    _returnOverviewScreen = () => {
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
                    <Segment>
                        <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                                onPress={(value) => {
                                    this.state.screen = 1;
                                    this.state.tab1Color = '#9195ae';
                                    this.state.tab2Color = '#00ae7e';
                                    this.state.tab3Color = '#00ae7e';
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>Overview</H2>
                        </Button>
                        <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                                onPress={(value) => {
                                    this.state.screen = 2;
                                    this.state.tab2Color = '#9195ae';
                                    this.state.tab1Color = '#00ae7e';
                                    this.state.tab3Color = '#00ae7e';
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>Add Review</H2>
                        </Button>
                        <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                                onPress={(value) => {
                                    this.state.screen = 3;
                                    this.state.tab3Color = '#9195ae';
                                    this.state.tab2Color = '#00ae7e';
                                    this.state.tab1Color = '#00ae7e';
                                    this._sendAllCommentsRetrieveRequest();
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>All Reviews</H2>
                        </Button>
                    </Segment>
                    <Content>
                        {this.state.service.name && (
                            <H1 style={{
                                alignSelf: 'center',
                                color: 'rgba(0,4,26,0.96)'
                            }}> {this.state.service.name} </H1>
                        )}
                        {this.state.service.titleURL && (
                            <Image
                                source={{uri: this.state.service.titleURL}}
                                style={styles.titleIcon}
                            />
                        )}
                        <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                            <Icon name='text' size={25} color="#808080"/>
                            <H3 style={{
                                alignSelf: 'flex-start',
                                color: 'rgba(0,4,19,0.66)'
                            }}> {this.state.service.description} </H3>
                        </Item>
                        {this.state.service.fee && (
                            <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                                <Icon name='cash' size={25} color="#808080"/>
                                <H3 style={{
                                    alignSelf: 'flex-start',
                                    color: 'rgba(0,4,19,0.66)'
                                }}> {this.state.service.fee + ' LKR Per person'} </H3>
                            </Item>
                        )}
                    </Content>
                </ScrollView>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                        onPress={() => {
                            this.props.navigation.navigate('NavScreen1')
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
    };

    _handleratingCompleted = async (rating) => {
        console.log("Rating is: " + rating);
        let state = this.state;
        if (rating) {
            state.rating = rating;
        }
        console.log(state);
        this.setState(state);
    };

    _returnAddReviewScreen = () => {
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
                    <Segment>
                        <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                                onPress={(value) => {
                                    this.state.screen = 1;
                                    this.state.tab1Color = '#9195ae';
                                    this.state.tab2Color = '#00ae7e';
                                    this.state.tab3Color = '#00ae7e';
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>Overview</H2>
                        </Button>
                        <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                                onPress={(value) => {
                                    this.state.screen = 2;
                                    this.state.tab2Color = '#9195ae';
                                    this.state.tab1Color = '#00ae7e';
                                    this.state.tab3Color = '#00ae7e';
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>Add Review</H2>
                        </Button>
                        <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                                onPress={(value) => {
                                    this.state.screen = 3;
                                    this.state.tab3Color = '#9195ae';
                                    this.state.tab2Color = '#00ae7e';
                                    this.state.tab1Color = '#00ae7e';
                                    this._sendAllCommentsRetrieveRequest();
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>All Reviews</H2>
                        </Button>
                    </Segment>
                    <Content>
                        <Avatar rounded xlarge center
                                source={this.state.image ? this.state.image : userImage}
                                style={{height: 250, width: 250, alignSelf: 'center', marginTop: 20}}
                                onPress={() => this._pickImage()}
                                showEditButton/>
                        <AirbnbRating
                            count={5}
                            reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                            defaultRating={5}
                            size={30}
                            onFinishRating={this._handleratingCompleted}
                        />
                        <Form>
                            <Textarea rowSpan={5} bordered placeholder="Comments... "
                                      onChangeText={(text) => this._handleCommentChangeAsync(text)}
                                      value={this.state.comment}/>
                        </Form>
                    </Content>
                </ScrollView>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%', marginBottom: 5}}
                        onPress={() => this._sendServiceRatingCommentRequest()}>
                    <H1>SUBMIT</H1>
                </Button>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                        onPress={() => {
                            this.props.navigation.navigate('NavScreen1')
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
    };

    _returnAllReviewsScreen = () => {
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
                    <Segment>
                        <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                                onPress={(value) => {
                                    this.state.screen = 1;
                                    this.state.tab1Color = '#9195ae';
                                    this.state.tab2Color = '#00ae7e';
                                    this.state.tab3Color = '#00ae7e';
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>Overview</H2>
                        </Button>
                        <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                                onPress={(value) => {
                                    this.state.screen = 2;
                                    this.state.tab2Color = '#9195ae';
                                    this.state.tab1Color = '#00ae7e';
                                    this.state.tab3Color = '#00ae7e';
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>Add Review</H2>
                        </Button>
                        <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                                onPress={(value) => {
                                    this.state.screen = 3;
                                    this.state.tab3Color = '#9195ae';
                                    this.state.tab2Color = '#00ae7e';
                                    this.state.tab1Color = '#00ae7e';
                                    this.state.isLoading = true;
                                    this._sendAllCommentsRetrieveRequest();
                                    this.forceUpdate();
                                }}>
                            <H2 style={{marginLeft: 5}}>All Reviews</H2>
                        </Button>
                    </Segment>
                    <Content>
                        <AirbnbRating
                            count={5}
                            reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                            defaultRating={this.state.avgRating}
                            size={30}
                            showRating={true}
                            isDisabled = {true}
                        />
                        {this.state.comments && this.state.comments.map((comment) => (
                            <Card key={comment.key} id={comment.key}>
                                {
                                    comment.userPhotoURL && (
                                        <CardItem>
                                            <Left>
                                                <Thumbnail source={{uri: comment.userPhotoURL}}/>
                                                <Body>
                                                    <Text>{comment.userFullName}</Text>
                                                    <Text note>{comment.country}</Text>
                                                </Body>
                                            </Left>
                                        </CardItem>
                                    )
                                }
                                {
                                    comment.photoURL && (
                                        <CardItem cardBody>
                                            <Image source={{uri: comment.photoURL}}
                                                   style={{height: 250, width: null, flex: 1}}/>
                                        </CardItem>)
                                }
                                {
                                    comment.comment && (
                                        <CardItem>
                                            <Left>
                                                <Body>
                                                    <Text>{comment.comment}</Text>
                                                    <AirbnbRating
                                                        count={5}
                                                        reviews={["Terrible", "Bad", "Normal", "Good", "Very Good"]}
                                                        defaultRating={comment.rating}
                                                        size={15}
                                                        starContainerStyle = {{alignSelf: 'flex-start'}}
                                                        showRating={false}
                                                        isDisabled = {true}
                                                    />
                                                </Body>
                                            </Left>
                                        </CardItem>
                                    )

                                }
                            </Card>
                        ))}
                    </Content>
                </ScrollView>
                <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                        onPress={() => {
                            this.props.navigation.navigate('NavScreen1')
                        }}>
                    <H1>BACK</H1>
                </Button>
            </Container>
        );
    };

    _sendAllCommentsRetrieveRequest = async () => {
        console.log("Sending comments retrieve request ");
        let responseObj = await RequestHandler.getAllServiceComments(this.state.service.serviceID);
        console.log(responseObj);
        let state = this.state;
        if (responseObj.status === 'SUCCESS') {
            state.avgRating = responseObj.avgRating;
            let commentsArr = [];
            for (let i = 0; i < responseObj.comments.length; i++) {
                let comment = responseObj.comments[i];
                comment.userPhotoURL = RequestHandler.getImageUrl(comment.userPictureID);
                comment.key = i;
                comment.photoURL = RequestHandler.getImageUrl(comment.photo);
                commentsArr.push(comment);
            }
            state.comments = commentsArr;
        } else {
            alert("Cannot retrieve the comments for this service ")
        }
        state.isLoading = false;
        this.setState(state);
    };

    _handleCommentChangeAsync = async (comment) => {
        let state = this.state;
        state.comment = comment;
        console.log(comment);
        this.setState(state);
    };

    _sendServiceRatingCommentRequest = async () => {
        let user = await Util.getAuthToken();
        console.log("userId");
        console.log(user);
        if (user.username) {
            let response = await RequestHandler.sendServiceRatingComment(
                user.username, this.state.service.serviceID, this.state.rating, this.state.comment, this.state.image.base64
            );
            if (response.status === 'SUCCESS') {
                alert('Successfully sent the rating!');
                let state = this.state;
                state.rating = 5;
                state.comment = '';
                state.image = undefined;
                this.setState(state);
            } else {
                alert("Couldn't post the comment. Please try again!");
            }
        } else {
            alert("Couldn't post the comment. Please try again!");
        }
    };

    _pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
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
