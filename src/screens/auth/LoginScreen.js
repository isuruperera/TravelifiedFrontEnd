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
    Input,
    Item,
    Label,
    Left,
    Right,
    Text,
    Title
} from 'native-base';
import bgImgStyle from "../register/styles";
import {ImageBackground} from 'react-native'
import RequestHandler from '../../util/RESTRequestHandler'
import Util from '../../util/Util'


const launchscreenBg = require("../../../assets/images/screen-bg.png");

export default class LoginScreen extends React.Component {

    constructor(props) {
        super(props);
        this.isLoading = true;
        this.state = {
            login: {
                email: undefined,
                emailError: undefined,
                password: undefined,
                passwordError: undefined,
                loginError: undefined,
            }
        };
    }

    render() {
        return (
            <Container>
                <Header>
                    <Left/>
                    <Body style={{flex: 1}}>
                        <Title>User Login</Title>
                    </Body>
                    <Right/>
                </Header>
                <ImageBackground source={launchscreenBg} style={bgImgStyle.imageContainer}>
                    <Content>
                        <Form style={{paddingTop: 100}}>
                            <Item floatingLabel>
                                <Label>Email</Label>
                                <Input
                                    onChangeText={(email) => this._handleEmailChangeAsync(email)}
                                    value={this.state.login.email}
                                />

                            </Item>
                            {this.state.login.emailError && (
                                <Text style={{color: 'red', paddingLeft: 5}}> {this.state.login.emailError} </Text>
                            )}
                            <Item floatingLabel last>
                                <Label>Password</Label>
                                <Input
                                    onChangeText={(text) => this._handlePwdChangeAsync(text)}
                                    value={this.state.login.password}
                                    secureTextEntry={true}
                                />
                            </Item>
                        </Form>
                    </Content>
                    {this.state.login.loginError && (
                        <Text style={{color: 'red', paddingLeft: 5}}> {this.state.login.loginError} </Text>
                    )}
                    <Footer style={{marginBottom: 7}}>
                        <FooterTab>
                            <Button
                                onPress={() => this._handleLoginAsync()}>
                                <Text style={{fontSize: 16}}>LOGIN</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                    <Footer style={{marginBottom: 7}}>
                        <FooterTab>
                            <Button
                                onPress={() => this._handleRegisterAsync()}>
                                <Text style={{fontSize: 16}}>REGISTER</Text>
                            </Button>
                        </FooterTab>
                    </Footer>
                </ImageBackground>
            </Container>
        );
    }

    _handleLoginAsync = async () => {
        console.log("Sending registration request...");
        this._validateEmailAsync();
        this._validatePwdAsync();
        if (this.state.login.emailError || this.state.login.passwordError) {
            this.state.login.loginError = "Input Validation Failed!";
            this.forceUpdate();
        } else {
            let loginResp = await RequestHandler.sendLoginRequest(
                this.state.login.email,
                this.state.login.password);
            console.log(loginResp);
            if (loginResp.status === "SUCCESS") {
                let authToken = {
                    token: loginResp.token,
                    id: loginResp.id,
                    adminToken: loginResp.adminToken ? loginResp.adminToken : undefined,
                    username: this.state.login.email,
                };
                await Util.putAuthToken(authToken);
                await Util.putProfilePictureID(loginResp.profilePicID);
                this.props.navigation.navigate('AuthLoading');
            } else {
                alert("Failed to login!");
            }
        }


    };

    _handleRegisterAsync = async () => {
        this.props.navigation.navigate('Register')
    };

    _handleEmailChangeAsync = async (email) => {
        let state = this.state;
        state.login.email = email;
        this.setState(state);
        this._validateEmailAsync(email);

    };

    _validateEmailAsync = async () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(this.state.login.email) === false) {
            this.state.login.emailError = "Invalid Email Address!";
        } else {
            this.state.login.emailError = undefined;
        }
    };

    _handlePwdChangeAsync = async (pwd) => {
        let state = this.state;
        state.login.password = pwd;
        this.setState(state);
        this._validatePwdAsync(pwd);

    };

    _validatePwdAsync = async () => {
        if (!this.state.login.password || this.state.login.password === "") {
            this.state.login.passwordError = "Password cannot be blank.";
        } else {
            this.state.login.passwordError = undefined;
        }
    };
}