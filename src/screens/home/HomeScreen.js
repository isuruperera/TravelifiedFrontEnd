import React, { Component } from 'react';
//import react in our code.
import {
    View,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    Platform,
    Text,
} from 'react-native';
// import all basic components

//Import required react-navigation component
import {
    createDrawerNavigator,
    createStackNavigator,
    createAppContainer,
} from 'react-navigation';

//Import all the screens
import MainMapScreen from './MainMapScreen';
import TravelExpenseScreen from '../travelexpenses/TravelExpensesEstimateScreen';
import UserProfileScreen from '../userprofile/UserProfile';
import AttractionScreen from '../attraction/AttractionProfile';
import ServiceScreen from '../service/ServiceProfile';
import EventsScreen from '../events/EventsScreen';
import SingleEventsScreen from '../events/SingleEventScreen';
import FriendsScreen from '../friends/Friends';
import FriendProfileScreen from '../userprofile/FriendProfile';
import AdminScreen from '../admin/AdminScreen';

//Import Custom Sidebar
import CustomSidebarMenu from './SideMenu';

global.currentScreenIndex = 0;

//Navigation Drawer Structure for all screen
class HomeScreen extends Component {
    //Top Navigation Header with Donute Button
    toggleDrawer = () => {
        //Props to open/close the drawer
        this.props.navigationProps.toggleDrawer();
    };
    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    {/*Donute Button Image */}
                    <Image
                        source={require('../../../assets/images/menu.png')}
                        style={{ width: 25, height: 25, marginLeft: 15 }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}



//Stack Navigator for the First Option of Navigation Drawer
const FirstActivity_StackNavigator = createStackNavigator({
    //All the screen from the First Option will be indexed here
    First: {
        screen: MainMapScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Discover Travelified',
            headerLeft: <HomeScreen navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00C691',
            },
            headerTintColor: '#000',
        }),
    },
});

const TravelExpenses_StackNavigator = createStackNavigator({
    Third: {
        screen: TravelExpenseScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Estimate Expenses',
            headerLeft: <HomeScreen navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00C691',
            },
            headerTintColor: '#000',
        }),
    },
});

//Drawer Navigator Which will provide the structure of our App
const DrawerNavigatorExample = createDrawerNavigator(
    {
        //Drawer Optons and indexing
        NavScreen1: {
            screen: FirstActivity_StackNavigator,
            navigationOptions: {
                drawerLabel: 'Main Menu',
            },
        },
        NavScreen2: {
            screen: FriendsScreen,
            navigationOptions: {
                drawerLabel: 'Menu 2',
            },
        },
        NavScreen3: {
            screen: EventsScreen,
            navigationOptions: {
                drawerLabel: 'Tourist Events',
            },
        },
        NavScreen4: {
            screen: TravelExpenses_StackNavigator,
            navigationOptions: {
                drawerLabel: 'Estimate Expenses',
            },
        },
        UserProfileScreen: {
            screen: UserProfileScreen,
            navigationOptions: {
                drawerLabel: 'My Profile',
            },
        },
        AttractionScreen: {
            screen: AttractionScreen,
            navigationOptions: {
                drawerLabel: 'Tourist Attraction',
            },
        },
        ServiceScreen: {
            screen: ServiceScreen,
            navigationOptions: {
                drawerLabel: 'Tourist Service',
            },
        },
        EventsScreen: {
            screen: EventsScreen,
            navigationOptions: {
                drawerLabel: 'Tourist Event',
            },
        },
        SingleEventsScreen: {
            screen: SingleEventsScreen,
            navigationOptions: {
                drawerLabel: 'Tourist Event',
            },
        },
        FriendProfileScreen: {
            screen: FriendProfileScreen,
            navigationOptions: {
                drawerLabel: 'Friend Profile',
            },
        },
        AdminScreen: {
            screen: AdminScreen,
            navigationOptions: {
                drawerLabel: 'Admin Screen',
            },
        },
    },
    {
        //For the Custom sidebar menu we have to provide our CustomSidebarMenu
        contentComponent: CustomSidebarMenu,
        //Sidebar width
        drawerWidth: Dimensions.get('window').width - 130,
    }
);
export default createAppContainer(DrawerNavigatorExample);