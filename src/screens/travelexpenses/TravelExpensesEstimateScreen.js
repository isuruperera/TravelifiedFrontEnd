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
    View
} from 'native-base';
import {Dimensions, Image, ScrollView, StyleSheet} from 'react-native';
import RequestHandler from '../../util/RESTRequestHandler';
import SearchableDropdown from 'react-native-searchable-dropdown';
import RadioForm from 'react-native-simple-radio-button';
import bgImgStyle from "../register/styles";
import MapView from 'react-native-maps';

const townIcon = require('../../../assets/images/cityscape.png');


const userImage = require("../../../assets/images/travelified-logo.png");
const config = require('../../config/config.json');


export default class TravelExpensesEstimateScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            service: undefined,
            screen: 1,
            towns: undefined,
            currentFromTown: undefined,
            currentToTown: undefined,
            currentTown: undefined,
            currentTownOptions: undefined,
            townLocation: undefined,
            busFareOptions: undefined,
            selectedActivities: [],
            selectedBusCategory: undefined,
            transportOptions: [],
            comment: '',
            totalTransportFee: undefined,
            totalActivityFee: undefined,
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
        let fromTownsResp = await RequestHandler.sendTransportDataRequest(1);
        let toTownsResp = await RequestHandler.sendTransportDataRequest(2);
        let townsList = [];
        if (fromTownsResp.status === 'SUCCESS') {
            for (let i = 0; i < fromTownsResp.cities.length; i++) {
                townsList.push({id: i, name: fromTownsResp.cities[i]})
            }
        } else {
            alert("City information not found!")
        }
        if (toTownsResp.status === 'SUCCESS') {
            for (let i = 0; i < toTownsResp.cities.length; i++) {
                //townsList.push({id: i, name: toTownsResp.cities[i]})
            }
        } else {
            alert("City information not found!")
        }
        if (townsList.length > 0) {
            state.towns = townsList;
            state.isLoading = false;
            this.setState(state);
        }

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
            return this._returnTransportScreen();
        } else if (this.state.screen === 2) {
            return this._returnServicesScreen();
        } else {
            return this._returnSummaryScreen();
        }
    }

    _handleBusFaresAsync = async (state) => {
        console.log("Handling bus fare requests: " + state.currentFromTown + " " + state.currentToTown);
        if (state.currentFromTown && state.currentToTown) {
            let busFareResponse = await RequestHandler.sendBusInformationRequest(state.currentFromTown, state.currentToTown);
            if (busFareResponse && busFareResponse.status === 'SUCCESS') {
                let optionsList = [];
                for (let i = 0; i < busFareResponse.busFares.length; i++) {
                    let option = {
                        label: 'By: ' + busFareResponse.busFares[i].category + 'Bus;  Fee: ' + busFareResponse.busFares[i].fare + ' LKR',
                        value: busFareResponse.busFares[i].category,
                        fee: busFareResponse.busFares[i].fare,
                    };
                    optionsList.push(option)
                }
                state.busFareOptions = optionsList;
                state.selectedBusCategory = optionsList[0].value;
            } else {
                state.busFareOptions = undefined;
                state.selectedBusCategory = 'N/A'
            }
            console.log(state);
            this.setState(state);
        } else {
            this.setState(state);
        }
    };

    _pickCurrentTownAsync = async (town) => {
        console.log(town);
        let state = this.state;
        if (town) {
            state.currentTown = town.name;
        }
        let townCoords = await RequestHandler.sendLocationRequest(town.name);
        let townData = await RequestHandler.sendSummaryRequest(townCoords.longitude, townCoords.latitude);
        if (townCoords && townCoords.status === 'SUCCESS') {
            let args = {
                longitude: townCoords.longitude,
                latitude: townCoords.latitude
            };
            state.townLocation = args;
        }
        console.log("townData");
        console.log(townData);
        if (townData && townData.status == 'SUCCESS') {
            state.currentTownOptions = townData.attaractions;
        }
        this.setState(state);
        console.log(town);
    };

    _pickFromTownAsync = async (town) => {
        console.log(town);
        let state = this.state;
        if (town) {
            state.currentFromTown = town.name;
        }
        await this._handleBusFaresAsync(state);
        console.log(town);
    };

    _pickToTownAsync = async (town) => {
        console.log(town);
        let state = this.state;
        if (town) {
            state.currentToTown = town.name;
        }
        await this._handleBusFaresAsync(state);
        console.log(town);
    };

    _handleTransportOptionRemoveAsync = async (tsptOpts) => {
        console.log(tsptOpts);
        let state = this.state;
        let filteredOpts = [];
        for (let i = 0; i < state.transportOptions.length; i++) {
            let addedOpts = state.transportOptions[i];
            if (!(addedOpts.from === tsptOpts.from && addedOpts.to === tsptOpts.to
                && addedOpts.category === tsptOpts.category && addedOpts.fee === tsptOpts.fee)) {
                filteredOpts.push(addedOpts);
            }
        }
        state.transportOptions = filteredOpts;
        this.setState(state);
        await this._handleCalculateSummary();
    };

    _handleActivitySelectAsync = async (activity) => {
        console.log(activity);
        let state = this.state;
        let found = false;
        for (let i = 0; i < state.selectedActivities.length; i++) {
            let activityLocal = state.selectedActivities[i];
            if (activityLocal.serviceID === activity.serviceID) {
                found = true;
            }
        }
        if (!found) {
            activity.titlePhotoURL = await RequestHandler.getImageUrl(activity.titlePhoto)
            state.selectedActivities.push(activity)
        }
        this.setState(state);
        await this._handleCalculateSummary();
    };

    _handleActivityRemoveAsync = async (activity) => {
        let state = this.state;
        let filteredItems = [];
        for (let i = 0; i < state.selectedActivities.length; i++) {
            if (state.selectedActivities[i].serviceID !== activity.serviceID) {
                filteredItems.push(state.selectedActivities[i])
            }
        }
        state.selectedActivities = filteredItems;
        this.setState(state);
        await this._handleCalculateSummary();
    };

    _handleCalculateSummary = async () => {
        let state = this.state;
        let totalTransportFee = 0;
        for (let i = 0; i < state.transportOptions.length; i++) {
            totalTransportFee += state.transportOptions[i].fee;
        }
        let totalActivityFee = 0;
        for (let i = 0; i < state.selectedActivities.length; i++) {
            totalActivityFee += state.selectedActivities[i].fee;
        }
        state.totalTransportFee = totalTransportFee;
        state.totalActivityFee = totalActivityFee;
        this.setState(state);
    };

    _returnTransportScreen = () => {
        return (
            <Container style={{marginTop: 5}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Transport</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Services</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Summary</H2>
                    </Button>
                </Segment>
                <View>
                    <Text style={{marginLeft: 5}}>From</Text>
                    <SearchableDropdown
                        onTextChange={text => console.log(text)}
                        //On text change listner on the searchable input
                        onItemSelect={item => this._pickFromTownAsync(item)}
                        //onItemSelect called after the selection from the dropdown
                        containerStyle={{padding: 1}}
                        //suggestion container style
                        textInputStyle={{
                            //inserted text style
                            padding: 3,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6',
                        }}
                        itemStyle={{
                            //single dropdown item style
                            padding: 3,
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
                        items={this.state.towns}
                        //mapping of item array
                        defaultIndex={2}
                        //default selected item index
                        placeholder="Select start town"
                        //place holder for the search input
                        resetValue={false}
                        //reset textInput Value with true and false state
                        underlineColorAndroid="transparent"
                        //To remove the underline from the android input
                    />
                </View>
                <View>
                    <Text style={{marginLeft: 5}}>To</Text>
                    <SearchableDropdown
                        onTextChange={text => console.log(text)}
                        //On text change listner on the searchable input
                        onItemSelect={item => this._pickToTownAsync(item)}
                        //onItemSelect called after the selection from the dropdown
                        containerStyle={{padding: 1}}
                        //suggestion container style
                        textInputStyle={{
                            //inserted text style
                            padding: 3,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6',
                        }}
                        itemStyle={{
                            //single dropdown item style
                            padding: 3,
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
                        items={this.state.towns}
                        //mapping of item array
                        defaultIndex={2}
                        //default selected item index
                        placeholder="Select end town"
                        //place holder for the search input
                        resetValue={false}
                        //reset textInput Value with true and false state
                        underlineColorAndroid="transparent"
                        //To remove the underline from the android input
                    />
                </View>
                {
                    this.state.busFareOptions && (
                        <RadioForm
                            radio_props={this.state.busFareOptions}
                            initial={0}
                            onPress={(value) => this._handleBusFareCategoryAsync(value)}
                        />
                    )
                }
                {
                    !this.state.busFareOptions && this.state.currentFromTown && this.state.currentToTown && (
                        <Text style={{marginLeft: 5}}> {
                            'Sorry, There\'s no bus fare information available for ' + this.state.currentFromTown + " -> " + this.state.currentToTown
                        } </Text>
                    )
                }
                {this.state.busFareOptions && this.state.currentFromTown && this.state.currentToTown && (
                    <ListItem icon>
                        <Body>
                            <Text>{this.state.currentFromTown + " -> " + this.state.currentToTown + ' | ' + this.state.selectedBusCategory}</Text>
                        </Body>
                        <Right>
                            <Button style={{backgroundColor: "#00C691"}}
                                    onPress={() => this._handleAddTransportOpts()}>
                                <Icon active name="add"/>
                            </Button>
                        </Right>
                    </ListItem>
                )
                }
                <View style={{marginTop: 10}}>
                    {
                        this.state.transportOptions && (
                            this.state.transportOptions.map((options) => (
                                <ListItem icon key={options.from + options.to + options.fee + options.category}>
                                    <Left>
                                        <Button style={{backgroundColor: "#06ff00"}}>
                                            <Icon active name="pin"/>
                                        </Button>
                                    </Left>
                                    <Body>
                                        <Text>{options.from + ' -> ' + options.to + ' | ' + options.category + ' | ' + options.fee + ' LKR'}</Text>
                                    </Body>
                                    <Right>
                                        <Button style={{backgroundColor: "#c6000d"}}
                                                onPress={() => this._handleTransportOptionRemoveAsync(options)}>
                                            <Icon active name="remove"/>
                                        </Button>
                                    </Right>
                                </ListItem>
                            ))
                        )
                    }
                </View>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 2, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this.props.navigation.navigate('NavScreen1')
                                    }}>
                                <H1>BACK</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        );
    };

    _returnServicesScreen = () => {
        return (
            <Container style={{marginTop: 5}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Transport</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Services</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Summary</H2>
                    </Button>
                </Segment>
                <View>
                    <Text style={{marginLeft: 5}}>From</Text>
                    <SearchableDropdown
                        onTextChange={text => console.log(text)}
                        //On text change listner on the searchable input
                        onItemSelect={item => this._pickCurrentTownAsync(item)}
                        //onItemSelect called after the selection from the dropdown
                        containerStyle={{padding: 1}}
                        //suggestion container style
                        textInputStyle={{
                            //inserted text style
                            padding: 3,
                            borderWidth: 1,
                            borderColor: '#ccc',
                            backgroundColor: '#FAF7F6',
                        }}
                        itemStyle={{
                            //single dropdown item style
                            padding: 3,
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
                        items={this.state.towns}
                        //mapping of item array
                        defaultIndex={2}
                        //default selected item index
                        placeholder="Select start town"
                        //place holder for the search input
                        resetValue={false}
                        //reset textInput Value with true and false state
                        underlineColorAndroid="transparent"
                        //To remove the underline from the android input
                    />
                </View>
                {
                    this.state.townLocation && (
                        <MapView
                            style={{alignSelf: 'stretch', height: '25%'}}
                            region={{
                                latitude: this.state.townLocation.latitude,
                                longitude: this.state.townLocation.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}
                        >
                            <MapView.Marker
                                coordinate={this.state.townLocation}
                                title={this.state.currentTown}
                                description="Look around to discover more! "
                            >
                                <Image source={townIcon} style={{width: 50, height: 50}}/>
                            </MapView.Marker>
                            {
                                this.state.currentTownOptions && this.state.currentTownOptions.map((activity) => (
                                    <MapView.Marker
                                        coordinate={activity.location}
                                        title={activity.name + ' | ' + activity.fee + 'LKR'}
                                        description={activity.description}
                                        key={activity.serviceID}
                                        id={activity.serviceID}
                                        onPress={(value) => this._handleActivitySelectAsync(activity)}
                                    >
                                    </MapView.Marker>

                                ))
                            }
                        </MapView>
                    )
                }
                <ScrollView>
                    <View>
                        {
                            this.state.selectedActivities && (
                                this.state.selectedActivities.map((activity) => (
                                    <ListItem icon key={activity.serviceID}>
                                        <Left>
                                            <Image source={{uri: activity.titlePhotoURL}}
                                                   style={{width: 15, height: 15}}/>
                                        </Left>
                                        <Body>
                                            <Text>{activity.name + ' | ' + activity.fee + 'LKR '}</Text>
                                        </Body>
                                        <Right>
                                            <Button style={{backgroundColor: "#c6000b"}}
                                                    onPress={() => this._handleActivityRemoveAsync(activity)}>
                                                <Icon active name="remove"/>
                                            </Button>
                                        </Right>
                                    </ListItem>
                                ))
                            )
                        }
                    </View>

                </ScrollView>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 7, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this.props.navigation.navigate('NavScreen1')
                                    }}>
                                <H1>BACK</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        );
    };

    _returnSummaryScreen = () => {
        return (
            <Container style={{marginTop: 5}}>
                <Segment>
                    <Button first style={{backgroundColor: this.state.tab1Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 1;
                                this.state.tab1Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Transport</H2>
                    </Button>
                    <Button style={{backgroundColor: this.state.tab2Color, width: '33.34%'}}
                            onPress={(value) => {
                                this.state.screen = 2;
                                this.state.tab2Color = '#9195ae';
                                this.state.tab1Color = '#00ae7e';
                                this.state.tab3Color = '#00ae7e';
                                this.forceUpdate();
                            }}>
                        <H2 style={{marginLeft: 5}}>Services</H2>
                    </Button>
                    <Button last active style={{backgroundColor: this.state.tab3Color, width: '33.33%'}}
                            onPress={(value) => {
                                this.state.screen = 3;
                                this.state.tab3Color = '#9195ae';
                                this.state.tab2Color = '#00ae7e';
                                this.state.tab1Color = '#00ae7e';
                                this._handleCalculateSummary();
                            }}>
                        <H2 style={{marginLeft: 5}}>Summary</H2>
                    </Button>
                </Segment>
                <Text style={{marginLeft: 5, marginTop: 5}}>Transport</Text>
                <ScrollView>
                    <View style={{marginTop: 2}}>
                        {
                            this.state.transportOptions && (
                                this.state.transportOptions.map((options) => (
                                    <ListItem icon key={options.from + options.to + options.fee + options.category}>
                                        <Left>
                                            <Button style={{backgroundColor: "#06ff00"}}>
                                                <Icon active name="pin"/>
                                            </Button>
                                        </Left>
                                        <Body>
                                            <Text>{options.from + ' -> ' + options.to + ' | ' + options.category + ' | ' + options.fee + ' LKR'}</Text>
                                        </Body>
                                        <Right>
                                            <Button style={{backgroundColor: "#c6000d"}}
                                                    onPress={() => this._handleTransportOptionRemoveAsync(options)}>
                                                <Icon active name="remove"/>
                                            </Button>
                                        </Right>
                                    </ListItem>
                                ))
                            )
                        }
                    </View>
                    <Text style={{marginLeft: 5, marginTop: 2}}>Services</Text>
                    <View>
                        {
                            this.state.selectedActivities && (
                                this.state.selectedActivities.map((activity) => (
                                    <ListItem icon key={activity.serviceID}>
                                        <Left>
                                            <Image source={{uri: activity.titlePhotoURL}}
                                                   style={{width: 15, height: 15}}/>
                                        </Left>
                                        <Body>
                                            <Text>{activity.name + ' | ' + activity.fee + 'LKR '}</Text>
                                        </Body>
                                        <Right>
                                            <Button style={{backgroundColor: "#c6000b"}}
                                                    onPress={() => this._handleActivityRemoveAsync(activity)}>
                                                <Icon active name="remove"/>
                                            </Button>
                                        </Right>
                                    </ListItem>
                                ))
                            )
                        }
                    </View>
                    <Text style={{marginLeft: 5, marginTop: 5}}>Summary</Text>
                    {
                        this.state.totalTransportFee && this.state.totalActivityFee && (
                            <View>
                                <ListItem style = {{marginTop: 5}}>
                                    <Body>
                                        <Text style={{color: 'blue'}}>Transport Cost</Text>
                                    </Body>
                                    <Right>
                                        <Text style={{color: 'blue'}}>{this.state.totalTransportFee + ' LKR'}</Text>
                                    </Right>
                                </ListItem>
                                <ListItem>
                                    <Body>
                                        <Text style={{color: 'blue'}}>Activity Cost</Text>
                                    </Body>
                                    <Right>
                                        <Text style={{color: 'blue'}}>{this.state.totalActivityFee + ' LKR'}</Text>
                                    </Right>
                                </ListItem>
                                <ListItem>
                                    <Body>
                                        <Text style={{color: 'green'}}>Total Cost</Text>
                                    </Body>
                                    <Right>
                                        <Text
                                            style={{color: 'green'}}>{(this.state.totalTransportFee + this.state.totalActivityFee) + ' LKR'}</Text>
                                    </Right>
                                </ListItem>
                            </View>

                        )

                    }
                </ScrollView>
                <View style={bgImgStyle.bottom}>
                    <Footer style={{marginBottom: 3, backgroundColor: '#00C691'}}>
                        <FooterTab>
                            <Button full style={{backgroundColor: '#00ae7e', width: '100%'}}
                                    onPress={() => {
                                        this.props.navigation.navigate('NavScreen1')
                                    }}>
                                <H1>BACK</H1>
                            </Button>
                        </FooterTab>
                    </Footer>
                </View>
            </Container>
        );
    };

    _handleBusFareCategoryAsync = async (category) => {
        console.log(category);
        let state = this.state;
        state.selectedBusCategory = category;
        this.setState(state);
    };

    _handleAddTransportOpts = async () => {
        let state = this.state;
        let fee = undefined;
        console.log(state);
        for (let i = 0; i < state.busFareOptions.length; i++) {
            if (state.busFareOptions[i].value === state.selectedBusCategory) {
                fee = state.busFareOptions[i].fee;
            }
        }
        if (fee) {
            let tsptOpts = {
                from: state.currentFromTown,
                to: state.currentToTown,
                category: state.selectedBusCategory,
                fee: fee,
            };
            let found = false;
            for (let i = 0; i < state.transportOptions.length; i++) {
                let addedOpts = state.transportOptions[i];
                if (addedOpts.from === tsptOpts.from && addedOpts.to === tsptOpts.to
                    && addedOpts.category === tsptOpts.category && addedOpts.fee === tsptOpts.fee) {
                    found = true;
                }
            }
            if (!found) {
                state.transportOptions.push(tsptOpts);
            }
            this.setState(state);
            console.log(tsptOpts)
        }
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
