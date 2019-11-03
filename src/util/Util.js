import {AsyncStorage} from "react-native";

const Constants = require('./Constants.json');


export default (function () {

    let getAuthToken = async () => {
        try {
            let tokenStr = await AsyncStorage.getItem(Constants.AuthToken);
            return JSON.parse(tokenStr);
        } catch (e) {
            return null;
        }
    };

    let getProfilePictureID = async () => {
        try {
            return await AsyncStorage.getItem(Constants.ProfilePicID);
        } catch (e) {
            return null;
        }
    };

    let putAuthToken = async (token) => {
        try {
            await AsyncStorage.setItem(Constants.AuthToken, JSON.stringify(token));
        } catch (e) {
            console.error(e);
        }
    };

    let putProfilePictureID = async (id) => {
        try {
            await AsyncStorage.setItem(Constants.ProfilePicID, id);
        } catch (e) {
            console.error(e);
        }
    };

    let removeAuthToken = async () => {
        try {
            await AsyncStorage.removeItem(Constants.AuthToken);
        } catch (e) {
            console.error(e);
        }
    };

    let putUserProfileParams = async (params) => {
        try {
            await AsyncStorage.setItem(Constants.UserProfileParams, JSON.stringify(params));
        } catch (e) {
            console.error(e);
        }
    };

    let getUserProfileParams = async () => {
        try {
            let params = await AsyncStorage.getItem(Constants.UserProfileParams);
            return JSON.parse(params);
        } catch (e) {
            console.error(e);
        }
    };

    let putAttractionProfileParams = async (params) => {
        try {
            await AsyncStorage.setItem(Constants.AttractionProfileParams, JSON.stringify(params));
        } catch (e) {
            console.error(e);
        }
    };

    let getAttractionProfileParams = async () => {
        try {
            let params = await AsyncStorage.getItem(Constants.AttractionProfileParams);
            return JSON.parse(params);
        } catch (e) {
            console.error(e);
        }
    };

    let putServiceProfileParams = async (params) => {
        try {
            await AsyncStorage.setItem(Constants.ServiceProfileParams, JSON.stringify(params));
        } catch (e) {
            console.error(e);
        }
    };

    let getServiceProfileParams = async () => {
        try {
            let params = await AsyncStorage.getItem(Constants.ServiceProfileParams);
            return JSON.parse(params);
        } catch (e) {
            console.error(e);
        }
    };

    return {
        getAuthToken : getAuthToken,
        putAuthToken: putAuthToken,
        removeAuthToken: removeAuthToken,
        getProfilePictureID: getProfilePictureID,
        putProfilePictureID: putProfilePictureID,
        putUserProfileParams: putUserProfileParams,
        getUserProfileParams: getUserProfileParams,
        putAttractionProfileParams: putAttractionProfileParams,
        getAttractionProfileParams: getAttractionProfileParams,
        putServiceProfileParams: putServiceProfileParams,
        getServiceProfileParams: getServiceProfileParams
    }
}())