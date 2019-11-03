//This is an example code for Navigation Drawer with Custom Side bar//
//This Example is for React Navigation 3.+//
import React, {Component} from 'react';
import {Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import RequestHandler from '../../util/RESTRequestHandler'
import {Button} from "native-base";
import {AppLoading} from "expo";
import Util from '../../util/Util'



export default class CustomSidebarMenu extends Component {
    constructor() {
        super();
        //Setting up the Main Top Large Image of the Custom Sidebar

        this.proileImage = undefined;
        this._getProfilePictureAsync();
        //Array of the sidebar navigation option with icon and screen to navigate
        //This screens can be any screen defined in Drawer Navigator in App.js
        //You can find the Icons from here https://material.io/tools/icons/
        this.items = [
            {
                navOptionThumb: 'explore',
                navOptionName: 'Discover',
                screenToNavigate: 'NavScreen1',
            },
            {
                navOptionThumb: 'people',
                navOptionName: 'Friends',
                screenToNavigate: 'NavScreen2',
            },
            {
                navOptionThumb: 'chat',
                navOptionName: 'Chats',
                screenToNavigate: 'NavScreen3',
            },
            {
                navOptionThumb: 'event',
                navOptionName: 'Events',
                screenToNavigate: 'NavScreen3',
            },
            {
                navOptionThumb: 'assessment',
                navOptionName: 'Estimate Expenses',
                screenToNavigate: 'NavScreen4',
            },
        ];

        this._checkAndSetAdminOptionsAsync();
    }

    _checkAndSetAdminOptionsAsync = async() => {
        let authToken = await Util.getAuthToken();
        console.log(authToken);
        if(authToken.adminToken) {
            this.items.push({
                navOptionThumb: 'lock',
                navOptionName: 'Admin Area',
                screenToNavigate: 'NavScreen3',
            });
        }
    };

    _getProfilePictureAsync = async() => {
        let id = await Util.getProfilePictureID();
        this.proileImage = RequestHandler.getImageUrl(id);
    };

    _navigateToProfileScreenAsync = async() => {
        let params = {
            myProfile: true,
            profileImage: this.proileImage
        };
        await Util.putUserProfileParams(params);
        await this.props.navigation.navigate('UserProfileScreen');
    };

    render() {
        if(!this.proileImage) {
            <AppLoading/>
        }
        return (
            <View style={styles.sideMenuContainer}>
                {/*Top Large Image */}
                <TouchableOpacity onPress={() => {
                    this._navigateToProfileScreenAsync();
                }}>
                    <Image
                        source={{uri: this.proileImage}}
                        style={styles.sideMenuProfileIcon}
                    />
                </TouchableOpacity>
                {/*Divider between Top Image and Sidebar Option*/}
                <View
                    style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: '#e2e2e2',
                        marginTop: 0,
                    }}
                />
                {/*Setting up Navigation Options from option array using loop*/}
                <View style={{width: '100%'}}>
                    {this.items.map((item, key) => (
                        <View
                            key={key}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingTop: 10,
                                paddingBottom: 10,
                                backgroundColor: global.currentScreenIndex === key ? '#93ffe0' : '#00C691',
                            }}>
                            <View style={{marginRight: 10, marginLeft: 20}}>
                                <Icon name={item.navOptionThumb} size={25} color="#808080"/>
                            </View>
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: global.currentScreenIndex === key ? 'red' : 'black',
                                }}
                                onPress={() => {
                                    global.currentScreenIndex = key;
                                    this.props.navigation.navigate(item.screenToNavigate);
                                }}>
                                {item.navOptionName}
                            </Text>
                        </View>
                    ))}

                </View>
                <View style={{width: '100%', position: 'absolute', bottom: 0, flexDirection: 'row'}}>
                    <Button full style = {{backgroundColor: '#00ae7e', width: '100%'}}
                            onPress={() => this._handleLogoutAsync()}>
                        <Icon name='eject' size={25} color="#808080"/>
                        <Text style={{fontSize: 16}}>LOGOUT</Text>

                    </Button>
                </View>
            </View>
        );
    }

    _handleLogoutAsync = async () => {
        await Util.removeAuthToken();
        this.props.navigation.navigate('Auth');
    }


}
const styles = StyleSheet.create({
    sideMenuContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#00C691',
        alignItems: 'center',
        paddingTop: 20,
    },
    sideMenuProfileIcon: {
        resizeMode: 'center',
        width: 150,
        height: 150,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 150 / 2,
    },
});