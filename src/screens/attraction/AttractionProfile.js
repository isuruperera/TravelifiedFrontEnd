import React, {Component} from 'react';
import {Button, Container, Content, H1, H3, Spinner, View, Icon, Item, Segment} from 'native-base';

import Util from '../../util/Util';
import {Dimensions, Image, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import Svg, {Circle, Line, Polygon, Text} from 'react-native-svg';
import RequestHandler from '../../util/RESTRequestHandler'


const config = require('../../config/config.json');


export default class FloatingLabelExample extends Component {


    constructor(props) {
        super(props);
        this.state = {
            attraction: undefined,
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
        let screenParams = await Util.getAttractionProfileParams();
        console.log("screenParams Attraction Screen");
        console.log(screenParams);
        let state = this.state;
        if (screenParams) {
           state.attraction = screenParams;
           state.attraction.titleURL = await RequestHandler.getImageUrl(screenParams.titlePhotoUrl)
        }
        this.state.isLoading = false;
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
        console.log("Rendering State H1 ");
        console.log(this.state);
        console.log(this.state.userImageURL);
        return (
            <Container style={{marginTop: 20}}>
                <ScrollView
                    refreshControl= {
                        <RefreshControl
                            refreshing={this.state.isLoading}
                            onRefresh={() => this._loadScreenParams()}
                        />
                    }
                >
                    {this.state.attraction.attractionName && this.state.attraction.attractionName && (
                        <H1 style = {{alignSelf: 'center', color: 'rgba(0,4,26,0.96)'}}> {this.state.attraction.attractionName} </H1>
                    )}
                    {this.state.attraction.titleURL && (
                        <Image
                            source={{uri: this.state.attraction.titleURL}}
                            style={styles.titleIcon}
                        />
                    )}
                    <Item style={{marginRight: 10, marginLeft: 20, marginTop: 10}}>
                        <Icon name= 'text' size={25} color="#808080"/>
                        <H3 style = {{alignSelf: 'flex-start', color: 'rgba(0,4,19,0.66)'}}> {this.state.attraction.description} </H3>
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
