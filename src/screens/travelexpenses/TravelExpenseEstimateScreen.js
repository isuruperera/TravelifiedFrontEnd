import React from 'react';
import {Button, Container, Footer, FooterTab, Text, View, ListItem, Left, Right, Body, Icon} from 'native-base';
import RequestHandler from '../../util/RESTRequestHandler'
import {AppLoading,TouchableHighlight } from "expo";
import bgImgStyle from "../register/styles";
import SearchableDropdown from 'react-native-searchable-dropdown';
import RadioForm from 'react-native-simple-radio-button';
import MapView from 'react-native-maps';

import {Image, ScrollView} from 'react-native';

const townIcon = require('../../../assets/images/cityscape.png');

const Constants = require('../../util/Constants.json');


export default class TravelExpenseEstimateScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            busFares: undefined,
            townLocation: undefined,
            selectedBusFareCategory: undefined,
            fromTowns: undefined,
            toTowns: undefined,
            currentFromTown: undefined,
            currentToTown: undefined,
            stage: 0,
            townTransport: [],
            activities: [],
            selectedActivities: [],
            isLoading: true,
            totalTransportFee: undefined,
            totalActivityFee: undefined,
        }
    }

    componentDidMount() {
        this._getTransporcitiesAsync();
    }

    _getTransporcitiesAsync = async () => {
        let state = this.state;
        let fromTownsResp = await RequestHandler.sendTransportDataRequest(1);
        if (fromTownsResp.status === 'SUCCESS') {
            let fromTownList = [];
            for (let i = 0; i < fromTownsResp.cities.length; i++) {
                fromTownList.push({id: i, name: fromTownsResp.cities[i]})
            }
            state.fromTowns = fromTownList;
        } else {
            alert("City information not found!")
        }
        let toTownsResp = await RequestHandler.sendTransportDataRequest(2);
        if (toTownsResp.status === 'SUCCESS') {
            let toTownList = [];
            for (let i = 0; i < toTownsResp.cities.length; i++) {
                toTownList.push({id: i, name: toTownsResp.cities[i]})
            }
            state.toTowns = toTownList;
            //state.currentToTown = toTownList.length > 0 ? toTownList[0].name : "";
        } else {
            alert("City information not found!")
        }
        state.isLoading = false;
        console.log(state);
        this.setState(state);
    };

    render() {
        if (this.state.isLoading) {
            return <AppLoading/>;
        }
        if (this.state.stage === 0) {
            console.log("Stage zero;");
            return this._showFromTownScreen();
        } else if (this.state.stage === 1) {
            console.log("Stage 0ne;");
            return this._showToTownScreen();
        } else if (this.state.stage === 2) {
            console.log("Stage Two;");
            return this._showExploreTownScreen();
        } else if (this.state.stage === 5) {
            console.log("Stage Five;");
            return this._showFinalScreen();
        } else {
            return (
                <Container>
                    <Text/>
                </Container>
            );
        }

    }

    _pickTownAsync = async (town) => {
        let state = this.state;
        state.currentTown = town.name;
        if (state.stage === 0) {
            state.currentFromTown = state.currentTown;
        }
        this.setState(state);
        console.log(town)
    };

    _pickToTownAsync = async (town) => {
        let state = this.state;
        state.currentTown = town.name;
        this.setState(state);
        this._handleBusFaresAsync();
        console.log(town)
    };

    _handleVisitAnotherTownAsync = async () => {
        let state = this.state;
        if (state.currentTown) {
            state.currentFromTown = state.currentTown;
            state.currentTown = undefined;
            state.stage = 1;
        } else {
            alert("You have to pick a valid town to proceed!");
        }
        this.setState(state);
    };

    _switchToStageOne = async () => {
        let state = this.state;
        state.stage = 1;
        this.setState(state);
    };

    _pickNextToTownAsync = async () => {
        let state = this.state;
        let transportOpts = {
            from: state.currentFromTown,
            to: state.currentTown,
            category: state.selectedBusFareCategory,
        };
        state.townTransport.push(transportOpts);
        state.currentFromTown = transportOpts.to;
        state.currentToTown = undefined;
        state.busFares = undefined;
        state.stage = 1;
        console.log(state);
        this.setState(state);
    };

    _handleEndJourneyAsync = async () => {
        let state = this.state;
        let busFareEstimation = await RequestHandler.sendFareCalculateRequest(this.state.townTransport);
        let totalBusFare = 0;
        if(busFareEstimation && busFareEstimation.status === 'SUCCESS') {
            totalBusFare = busFareEstimation.fareEstimation;
        }
        let totalActivityFee = 0;
        for(let i=0; i < state.selectedActivities.length; i++) {
            totalActivityFee += state.selectedActivities[i].data.fee;
        }
        state.totalTransportFee = totalBusFare;
        state.totalActivityFee = totalActivityFee;
        state.stage = 5;
        console.log(busFareEstimation);
        this.setState(state);
    };

    _handleVisitPlacesAsync = async () => {
        let state = this.state;
        if (state.currentFromTown) {
            state.currentFromTown = state.stage === 0 ? state.currentTown : state.currentFromTown;
            let townCoords = undefined;
            let townData = undefined;
            if (state.currentFromTown) {
                townCoords = await RequestHandler.sendLocationRequest(state.currentFromTown);
                townData = await RequestHandler.sendSummaryRequest(state.currentFromTown);
            } else {
                townCoords = await RequestHandler.sendLocationRequest(state.currentTown);
                townData = await RequestHandler.sendSummaryRequest(state.currentFromTown);
            }
            console.log(townData);
            if (townCoords && townCoords.status === 'SUCCESS') {
                let args = {
                    longitude: townCoords.longitude,
                    latitude: townCoords.latitude
                };
                state.townLocation = args;
                state.stage = 2;
            } else {
                alert(townCoords.status);
            }
            if(townData && townData.status == 'SUCCESS') {
                let activitiesList = [];
                for (let i = 0; i < townData.attaractions.length; i++) {
                    activitiesList.push(
                        {id: i, data: townData.attaractions[i]})
                }
                state.activities = activitiesList;
            }

        } else {
            alert('Select a town first!')
        }
        console.log(state);
        this.setState(state);
    };

    _handleResetAllAsync = async () => {
        let prevState = this.state;
        let state = {
            fromTowns: prevState.fromTowns,
            toTowns: prevState.toTowns,
            currentFromTown: undefined,
            currentToTown: undefined,
            currentTown: undefined,
            stage: 0,
            townTransport: [],
            activities: [],
            selectedActivities: [],
            isLoading: false,
            totalTransportFee: undefined,
            totalActivityFee: undefined,
        };
        this.setState(state);
    };

    _handleBusFareCategoryAsync = async (category) => {
        let state = this.state;
        state.selectedBusFareCategory = category;
        this.setState(state);
    };

    _handleAttaractionRemoveAsync = async (id) => {
        console.log("Removing item..." + id);
        let state = this.state;
        let filteredItems = [];
        for(let i = 0; i < state.selectedActivities.length; i++) {
            if(state.selectedActivities[i].data.serviceID !== id) {
                filteredItems.push(state.selectedActivities[i])
            }
        }
        state.selectedActivities = filteredItems;
        this.setState(state);
    };

    _handleAttaractionSelectAsync = async (args, id) => {
        console.log(id);
        let state = this.state;
        let selectedActivity = undefined;
        console.log("Selecting Activity...");
        for (let i = 0; i < state.activities.length; i++) {
            let activity = state.activities[i];
            if(activity.data.serviceID === id) {
                selectedActivity = activity;
            }
        }
        console.log("Selected: " + selectedActivity);
        if(selectedActivity) {
            let containsKey = false;
            for(let i = 0; i < state.selectedActivities.length; i++) {
                if(state.selectedActivities[i].data.serviceID === selectedActivity.data.serviceID) {
                    containsKey = true;
                }
            }
            if(!containsKey) {
                state.selectedActivities.push(selectedActivity);
            }
        }
        this.setState(state);
    };

    _handleBusFaresAsync = async () => {
        let state = this.state;
        if (!state.currentFromTown || !state.currentTown) {
            console.log(state);
            alert("Please select the town you want to travel")
        } else {
            let busFareResponse = await RequestHandler.sendBusInformationRequest(state.currentFromTown, state.currentTown);
            if (busFareResponse && busFareResponse.status === 'SUCCESS') {
                let optionsList = [];
                for (let i = 0; i < busFareResponse.busFares.length; i++) {
                    let option = {
                        label: 'By: ' + busFareResponse.busFares[i].category + 'Bus; Fee: ' + busFareResponse.busFares[i].fare + ' LKR',
                        value: busFareResponse.busFares[i].category,
                    };
                    optionsList.push(option)
                }
                state.busFares = optionsList;
            } else {
                state.busFares = undefined;
                alert("Error occurred when calculating bus fares.")
            }
            console.log(state);
            this.setState(state);
        }

    };

    _showFromTownScreen = () => {
        return (
            <Container style={bgImgStyle.imageContainer}>
                {this.state.stage === 0 && (
                    <Text style = {{fontSize: 30, color: '#00cc05', paddingTop: 5, }}>
                        I'm starting my journey from:
                    </Text>
                )}
                <View>
                    <SearchableDropdown
                        onTextChange={text => console.log(text)}
                        //On text change listner on the searchable input
                        onItemSelect={item => this._pickTownAsync(item)}
                        //onItemSelect called after the selection from the dropdown
                        containerStyle={{padding: 5}}
                        //suggestion container style
                        textInputStyle={{
                            //inserted text style
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6',
                        }}
                        itemStyle={{
                            //single dropdown item style
                            padding: 10,
                            marginTop: 2,
                            backgroundColor: '#FAF9F8',
                            borderColor: '#bbb',
                            borderWidth: 1,
                        }}
                        itemTextStyle={{
                            //text style of a single dropdown item
                            color: '#222',
                        }}
                        itemsContainerStyle={{
                            //items container style you can pass maxHeight
                            //to restrict the items dropdown hieght
                            maxHeight: '100%',
                        }}
                        items={this.state.fromTowns}
                        //mapping of item array
                        defaultIndex={0}
                        //default selected item index
                        placeholder="Select a city"
                        //place holder for the search input
                        resetValue={false}
                        //reset textInput Value with true and false state
                        underlineColorAndroid="transparent"
                        //To remove the underline from the android input
                    />
                </View>
                {
                    this.state.currentTown && (
                        <View style={bgImgStyle.bottom}>

                            <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                                <FooterTab>
                                    <Button full
                                            onPress={() => this._handleVisitPlacesAsync()}>
                                        <Text style={{fontSize: 16}}>Visit places in {this.state.currentTown}</Text>
                                    </Button>
                                </FooterTab>
                            </Footer>

                            <Footer style={{marginBottom: 7}}>
                                <FooterTab>
                                    <Button full
                                            onPress={() => this._handleVisitAnotherTownAsync()}>
                                        <Text style={{fontSize: 16}}>Visit another town</Text>
                                    </Button>
                                </FooterTab>
                            </Footer>

                            <Footer style={{marginBottom: 7}}>
                                <FooterTab>
                                    <Button full
                                            onPress={() => this._handleResetAllAsync()}>
                                        <Text style={{fontSize: 16}}>Reset All</Text>
                                    </Button>
                                </FooterTab>
                            </Footer>
                        </View>
                    )
                }
            </Container>
        )
    };

    _showToTownScreen = () => {
        return (
            <Container style={bgImgStyle.imageContainer}>
                <Text style = {{fontSize: 30, color: '#0002cc', paddingTop: 5, }}>
                    Pick the next town to visit from {this.state.currentFromTown}
                </Text>
                <View>
                    <SearchableDropdown
                        onTextChange={text => console.log(text)}
                        //On text change listner on the searchable input
                        onItemSelect={item => this._pickToTownAsync(item)}
                        //onItemSelect called after the selection from the dropdown
                        containerStyle={{padding: 5}}
                        //suggestion container style
                        textInputStyle={{
                            //inserted text style
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6',
                        }}
                        itemStyle={{
                            //single dropdown item style
                            padding: 10,
                            marginTop: 2,
                            backgroundColor: '#FAF9F8',
                            borderColor: '#bbb',
                            borderWidth: 1,
                        }}
                        itemTextStyle={{
                            //text style of a single dropdown item
                            color: '#222',
                        }}
                        itemsContainerStyle={{
                            //items container style you can pass maxHeight
                            //to restrict the items dropdown hieght
                            maxHeight: '100%',
                        }}
                        items={this.state.toTowns}
                        //mapping of item array
                        defaultIndex={0}
                        //default selected item index
                        placeholder="Select a city"
                        //place holder for the search input
                        resetValue={false}
                        //reset textInput Value with true and false state
                        underlineColorAndroid="transparent"
                        //To remove the underline from the android input
                    />
                </View>
                {
                    this.state.busFares && (
                        <Text>
                            Pick how you're gonna travel to {this.state.currentTown}
                        </Text>
                    )
                }
                {
                    this.state.busFares && (
                        <RadioForm
                            radio_props={this.state.busFares}
                            initial={0}
                            onPress={(value) => this._handleBusFareCategoryAsync(value)}
                        />
                    )
                }
                {
                    this.state.currentTown && this.state.currentFromTown && (
                        <View style={bgImgStyle.bottom}>
                            <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                                <FooterTab>
                                    <Button full
                                            onPress={() => this._handleVisitPlacesAsync()}>
                                        <Text style={{fontSize: 16}}>Visit places in {this.state.currentFromTown}</Text>
                                    </Button>
                                </FooterTab>
                            </Footer>

                            <Footer style={{marginBottom: 7}}>
                                <FooterTab>
                                    <Button full
                                            onPress={() => this._pickNextToTownAsync()}>
                                        <Text style={{fontSize: 16}}>Go to {this.state.currentTown}</Text>
                                    </Button>
                                </FooterTab>
                            </Footer>

                            <Footer style={{marginBottom: 7}}>
                                <FooterTab>
                                    <Button full
                                            onPress={() => this._handleResetAllAsync()}>
                                        <Text style={{fontSize: 16}}>Reset All</Text>
                                    </Button>
                                </FooterTab>
                            </Footer>
                        </View>
                    )
                }
            </Container>
        )
    };

    _showFinalScreen = () => {
        return (
            <Container style={bgImgStyle.imageContainer}>
                <Text style = {{fontSize: 30, color: '#06cc00', paddingTop: 20,
                    justifyContent: 'center', //Centered vertically
                    textAlign: 'center', // Centered horizontally
                    }}> Total Transport Cost </Text>
                <Text style = {{fontSize: 40, color: '#000000',
                    textAlign: 'center', // Centered horizontally
                    flex:1}}> {this.state.totalTransportFee + ' LKR'} </Text>
                <Text style = {{fontSize: 30, color: '#00cc08',
                    justifyContent: 'center', //Centered vertically
                    textAlign: 'center', // Centered horizontally
                    }}> Total Cost For Activities and Services </Text>
                <Text style = {{fontSize: 40, color: '#000000',
                    textAlign: 'center', // Centered horizontally
                    flex:1}}> {this.state.totalActivityFee + ' LKR'} </Text>
                <Text style = {{fontSize: 30, color: '#0001cc',
                    justifyContent: 'center', //Centered vertically
                    textAlign: 'center', // Centered horizontally
                    }}> Total Estimated Cost For the Trip </Text>
                <Text style = {{fontSize: 60, color: '#08cc00',
                    textAlign: 'center', // Centered horizontally
                    flex:1}}> {(this.state.totalActivityFee + this.state.totalTransportFee) + ' LKR'} </Text>
                <Text style = {{fontSize: 15, color: '#cc0200',
                    textAlign: 'center', // Centered horizontally
                    }}> * Please note that the estimated prices are
                    subject to change due to demand and seasonal changes in the country.
                    Please consider this estimate as a rough guideline during your stay at Sri Lanka. </Text>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7}}>
                        <FooterTab>
                            <Button full
                                    onPress={() => this._handleResetAllAsync()}>
                                <Text style={{fontSize: 16}}>Reset All</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        )
    };

    _showExploreTownScreen = () => {
        return (
            <Container style={bgImgStyle.imageContainer}>
                {
                    this.state.townLocation && (
                        <MapView
                            style={{alignSelf: 'stretch', height: '40%'}}
                            region={{
                                latitude: this.state.townLocation.latitude,
                                longitude: this.state.townLocation.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}
                            onRegionChange={this._handleMapRegionChange}
                        >
                            <MapView.Marker
                                coordinate={this.state.townLocation}
                                title={this.state.currentTown}
                                description="Look around to discover more! "
                            >
                                <Image source={townIcon} style={{width: 50, height: 50}}/>
                            </MapView.Marker>
                            {
                                this.state.activities && this.state.activities.map( (activity) => (
                                    <MapView.Marker
                                        coordinate={activity.data.location}
                                        title={activity.data.name + ' | ' + activity.data.fee + 'LKR'}
                                        description= {activity.data.description}
                                        key = {activity.data.serviceID}
                                        id = {activity.data.serviceID}
                                        onPress={(value) => this._handleAttaractionSelectAsync(value, activity.data.serviceID)}
                                    >
                                    </MapView.Marker>
                                ))
                            }
                        </MapView>
                    )
                }
                <ScrollView>
                    {
                        this.state.selectedActivities && (
                            this.state.selectedActivities.map((activity) => (
                                <ListItem icon key = {activity.data.serviceID} >
                                    <Left>
                                        <Button style={{ backgroundColor: "#06ff00" }}>
                                            <Icon active name="pin" />
                                        </Button>
                                    </Left>
                                    <Body>
                                        <Text>{activity.data.name + ' | ' + activity.data.fee + 'LKR '}</Text>
                                    </Body>
                                    <Right>
                                        <Button style={{ backgroundColor: "#00C691" }}
                                                onPress = {() => this._handleAttaractionRemoveAsync(activity.data.serviceID)}>
                                            <Text>Remove</Text>
                                            <Icon active name="remove" />
                                        </Button>
                                    </Right>
                                </ListItem>
                            ))
                        )
                    }
                </ScrollView>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full
                                    onPress={() => this._handleEndJourneyAsync()}>
                                <Text style={{fontSize: 16}}>End my journey in {this.state.currentTown}</Text>
                            </Button>
                        </FooterTab>
                    </Footer>

                    <Footer style={{marginBottom: 7}}>
                        <FooterTab>
                            <Button full
                                    onPress={() => this._switchToStageOne()}>
                                <Text style={{fontSize: 16}}>Visit another town</Text>
                            </Button>
                        </FooterTab>
                    </Footer>

                    <Footer style={{marginBottom: 7}}>
                        <FooterTab>
                            <Button full
                                    onPress={() => this._handleResetAllAsync()}>
                                <Text style={{fontSize: 16}}>Reset All</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        )
    };
}