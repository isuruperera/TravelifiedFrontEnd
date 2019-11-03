import React from 'react';
import {
    Body,
    Button,
    Container,
    Content,
    Footer,
    FooterTab,
    Form,
    Header,
    Icon,
    Input,
    Item,
    Label,
    Left,
    Picker,
    Right,
    Text,
    Title,
    View
} from "native-base";
import {Avatar} from 'react-native-elements';
import {ImageBackground} from 'react-native'
import bgImgStyle from "../register/styles";
import RequestHandler from '../../util/RESTRequestHandler'
import * as ImagePicker from 'expo-image-picker';
import {AppLoading} from "expo";
import Util from "../../util/Util";


const launchscreenBg = require("../../../assets/images/screen-bg.png");
const userImage = require("../../../assets/images/travelified-logo.png");
const config = require('../../config/config.json');

export default class RegiterScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            countries: {
                LK: 'Sri Lanka'
            },
            user: {
                email: undefined,
                emailError: undefined,
                firstName: undefined,
                firstNameError: undefined,
                lastName: undefined,
                lastNameError: undefined,
                phoneNumber: undefined,
                phoneNumberError: undefined,
                password: undefined,
                passwordError: undefined,
                repeatPassword: undefined,
                repeatPasswordError: undefined,
                registerError: undefined,
                image: undefined,
                imageError: undefined,
                gender: 'Male',
                countryCode: 'LK',
                countryName: 'Sri Lanka'
            }
        };
    }

    componentDidMount() {
        this._fetchCountriesAsync();
    }

    _fetchCountriesAsync = async () => {
        let countries = await RequestHandler.getCountriesList();
        let countriesList = [];
        for(let key in countries) {
            countriesList.push({key: key, value: countries[key]});
        }
        let state = this.state;
        state.isLoading = false;
        state.countries = countriesList;
        this.setState(state);
        //console.log(this.state);

    };

    render() {
        if (this.state.isLoading) {
            return <AppLoading/>;
        }
        return (
            <Container>
                <Header>
                    <Left>
                        <Button onPress={() => this._handlePressBackAsync()}
                                transparent>
                            <Icon name='arrow-round-back'/>
                        </Button>
                    </Left>
                    <Body>
                        <Title>User Registration</Title>
                    </Body>
                    <Right/>
                </Header>
                <ImageBackground source={launchscreenBg} style={bgImgStyle.imageContainer}>
                    <View style={{
                        alignItems: 'center',
                        marginTop: 25,
                        marginBottom: 10,
                    }}>
                        <Avatar rounded xlarge center
                                source={this.state.user.image ? this.state.user.image : userImage}
                                style={{height: 150, width: 150}}
                                onPress={() => this._pickImage()}
                                showEditButton/>
                        {this.state.user.imageError && (
                            <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.imageError} </Text>
                        )}
                    </View>
                    <Content>
                        <Form>
                            <Item floatingLabel>
                                <Label>Email</Label>
                                <Input
                                    onChangeText={(email) => this._handleEmailChangeAsync(email)}
                                    value={this.state.user.email}
                                />
                            </Item>
                            {this.state.user.emailError && (
                                <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.emailError} </Text>
                            )}
                            <Item floatingLabel>
                                <Label>First Name</Label>
                                <Input
                                    onChangeText={(text) => this._handleFNameChangeAsync(text)}
                                    value={this.state.user.firstName}
                                />

                            </Item>
                            {this.state.user.firstNameError && (
                                <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.firstNameError} </Text>
                            )}
                            <Item floatingLabel>
                                <Label>Last Name</Label>
                                <Input
                                    onChangeText={(text) => this._handleLNameChangeAsync(text)}
                                    value={this.state.user.lastName}
                                />

                            </Item>
                            {this.state.user.lastNameError && (
                                <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.lastNameError} </Text>
                            )}
                            <Item floatingLabel>
                                <Label>Phone Number</Label>
                                <Input
                                    onChangeText={(text) => this._handlePhoneChangeAsync(text)}
                                    value={this.state.user.phoneNumber}
                                />

                            </Item>
                            {this.state.user.phoneNumberError && (
                                <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.phoneNumberError} </Text>
                            )}
                            <Item floatingLabel last>
                                <Label>Password</Label>
                                <Input
                                    onChangeText={(text) => this._handlePwdChangeAsync(text)}
                                    value={this.state.user.password}
                                    secureTextEntry={true}
                                />
                            </Item>
                            {this.state.user.passwordError && (
                                <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.passwordError} </Text>
                            )}
                            <Item floatingLabel last>
                                <Label>Repeat Password</Label>
                                <Input
                                    onChangeText={(text) => this._handlePwdRepeatAsync(text)}
                                    value={this.state.user.repeatPassword}
                                    secureTextEntry={true}
                                />
                            </Item>
                            {this.state.user.repeatPasswordError && (
                                <Text style={{
                                    color: 'red',
                                    paddingLeft: 5
                                }}> {this.state.user.repeatPasswordError} </Text>
                            )}
                            <View>
                                <Picker
                                    mode="dropdown"
                                    iosIcon={<Icon name="arrow-down" />}
                                    placeholder="Country"
                                    placeholderStyle={{ color: "#bfc6ea" }}
                                    placeholderIconColor="#007aff"
                                    style={{width: 250, marginLeft: 8}}
                                    selectedValue={this.state.user.countryName}
                                    onValueChange={this._pickCountryAsync.bind(this)}
                                >
                                    {
                                        this.state.countries.map(
                                            (country, key) => {
                                                //console.log(country);
                                                return (
                                                    <Picker.Item label={country.value}
                                                                 value={country.value}
                                                                 key={country.value}/>
                                                );
                                            }
                                        )
                                    }
                                </Picker>
                            </View>
                            <View>
                                <Picker
                                    mode="dropdown"
                                    iosIcon={<Icon name="arrow-down" />}
                                    placeholder="Gender"
                                    placeholderStyle={{ color: "#bfc6ea" }}
                                    placeholderIconColor="#007aff"
                                    style={{width: 250, marginLeft: 8}}
                                    selectedValue={this.state.user.gender}
                                    onValueChange={this._pickGenderAsync.bind(this)}
                                >
                                    <Picker.Item label="Male" value="Male"/>
                                    <Picker.Item label="Female" value="Female"/>
                                    <Picker.Item label="Other" value="Other"/>
                                </Picker>
                            </View>
                        </Form>
                    </Content>
                    {this.state.user.registerError && (
                        <Text style={{color: 'red', paddingLeft: 5}}> {this.state.user.registerError} </Text>
                    )}
                    <Footer>
                        <FooterTab>
                            <Button full
                                    onPress={() => this._handleRegisterAsync()}>
                                <Text style={{fontSize: 16}}>REGISTER</Text>
                            </Button>
                        </FooterTab>

                    </Footer>
                </ImageBackground>
            </Container>
        );
    }

    _pickCountryAsync = async (country) => {
        let state = this.state;
        state.user.countryName = country;
        this.setState(state);
        console.log(country)
    };

    _pickGenderAsync = async (gender) => {
        let state = this.state;
        state.user.gender = gender;
        this.setState(state);
        console.log(this.state.user)
    };

    _validateGenderAsync = async () => {

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
            state.user.image = undefined;
        } else {
            state.user.image = result;

        }
        this.setState(state);
        this._validateImageAsync();
        console.log(state.user.image);

    };

    _validateImageAsync = async () => {
        if (!this.state.user.image) {
            this.state.user.imageError = "You must pick a profile picture!";
        } else {
            this.state.user.imageError = undefined;
        }
    };

    _handleRegisterAsync = async () => {
        console.log("Handling register request");
        let that = this;
        await this._validateEmailAsync();
        await this._validateFNameAsync();
        await this._validateLNameAsync();
        await this._validateNumberAsync();
        await this._validatePwdAsync();
        await this._validatePwdRepeatAsync();
        await this._validateImageAsync();
        console.log(this.state.user);
        if (this.state.user.emailError || this.state.user.firstNameError || this.state.user.lastNameError
            || this.state.user.phoneNumberError
            || this.state.user.passwordError || this.state.user.repeatPasswordError || this.state.user.imageError) {
            this.state.user.registerError = "Input validation failed!";
            this.forceUpdate();
            console.log("Input validation failed!");
        } else {
            this._sendRegisterRequest(
                this.state.user.email,
                this.state.user.firstName,
                this.state.user.lastName,
                this.state.user.phoneNumber,
                this.state.user.countryName,
                this.state.user.gender,
                this.state.user.password,
                this.state.user.image.base64,
            );
        }
    };

    _handlePressBackAsync = async () => {
        this.props.navigation.navigate('SignIn')
    };

    _sendRegisterRequest = async (email, fName, lName, phone, country, gender, password, image) => {
        console.log("Sending registration request...");
        let registerResp = await RequestHandler.sendRegisterRequest(email, fName, lName, phone, country, gender, password, image);
        if (registerResp.status === "SUCCESS") {
            let authToken = {
                token: registerResp.token,
                id: registerResp.id,
                username: email,
            };
            await Util.putAuthToken(authToken);
            await Util.putProfilePictureID(registerResp.profilePicID);
            this.props.navigation.navigate('AuthLoading');
        } else {
            alert("Failed to register! User might be already registered.");
        }
    };

    _handleEmailChangeAsync = async (email) => {
        let state = this.state;
        state.user.email = email;
        this.setState(state);
        this._validateEmailAsync();

    };

    _validateEmailAsync = async () => {
        console.log("Validating Email");
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!this.state.user.email || this.state.user.email === "") {
            this.state.user.emailError = "Email cannot be blank!";
            console.log("Email cannot be blank!");
        } else {
            if (reg.test(this.state.user.email) === false) {
                this.state.user.emailError = "Invalid Email Address!";
            } else {
                this.state.user.emailError = undefined;
            }
        }
    };

    _handleFNameChangeAsync = async (name) => {
        let state = this.state;
        state.user.firstName = name;
        this.setState(state);
        this._validateFNameAsync();
    };

    _validateFNameAsync = async () => {
        if (!this.state.user.firstName || this.state.user.firstName === "") {
            this.state.user.firstNameError = "First name cannot be blank.";
        } else {
            this.state.user.firstNameError = undefined;
        }
    };

    _handleLNameChangeAsync = async (name) => {
        let state = this.state;
        state.user.lastName = name;
        this.setState(state);
        this._validateLNameAsync();

    };

    _validateLNameAsync = async () => {
        if (!this.state.user.lastName || this.state.user.lastName === "") {
            this.state.user.lastNameError = "Last name cannot be blank.";
        } else {
            this.state.user.lastNameError = undefined;
        }
    };

    _handlePhoneChangeAsync = async (number) => {
        let state = this.state;
        state.user.phoneNumber = number;
        this.setState(state);
        this._validateNumberAsync();

    };

    _validateNumberAsync = async () => {
        if (!this.state.user.phoneNumber || this.state.user.phoneNumber === "") {
            this.state.user.phoneNumberError = "Phone number cannot be blank.";
        } else {
            this.state.user.phoneNumberError = undefined;
        }
    };

    _handlePwdChangeAsync = async (pwd) => {
        let state = this.state;
        state.user.password = pwd;
        this.setState(state);
        this._validatePwdAsync();

    };

    _validatePwdAsync = async () => {
        if (!this.state.user.password || this.state.user.password === "") {
            this.state.user.passwordError = "Password cannot be blank!";
        } else {
            if (this.state.user.password && this.state.user.password.length < 6) {
                this.state.user.passwordError = "Password should contain at least 6 characters!";
            } else {
                this.state.user.passwordError = undefined;
            }
        }
    };

    _handlePwdRepeatAsync = async (pwd) => {
        let state = this.state;
        state.user.repeatPassword = pwd;
        this.setState(state);
        this._validatePwdRepeatAsync();

    };

    _validatePwdRepeatAsync = async () => {
        if (!this.state.user.repeatPassword || this.state.user.repeatPassword === ""
            || !this.state.user.password || this.state.user.repeatPassword !== this.state.user.password) {
            this.state.user.repeatPasswordError = "Passwords do not match!";
        } else {
            this.state.user.repeatPasswordError = undefined;
        }
    };

}



