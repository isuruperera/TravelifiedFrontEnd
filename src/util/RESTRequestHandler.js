const config = require('../config/config.json');
import * as Crypto from 'expo-crypto';


export default (function () {

    let sendUserProfileRequest = async (username) => {
        let args = {
            username: username
        };
        return sendPostRequest(args, 'user/profile');
    };

    let sendFareCalculateRequest = async (argsList) => {
        let args = {
            request: argsList
        };
        return sendPostRequest(args, 'calculateFare');
    };

    let sendSummaryRequest = async (locationID) => {
        let args = {
            locationID: locationID
        };
        return sendPostRequest(args, 'summary');
    };

    let sendLocationRequest = async (locationID) => {
        let args = {
            locationID: locationID
        };
        return sendPostRequest(args, 'location');
    };

    let sendTransportDataRequest = async (requestType) => {
        let args = {
            requestType: requestType
        };
        return sendPostRequest(args, 'transport');
    };

    let sendBusInformationRequest = async (from, to) => {
        let args = {
            from: from,
            to: to
        };
        return sendPostRequest(args, 'busfare');
    };

    let sendLoginRequest = async (email, password) => {
        const pwdDigest = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256, password
        );
        let args = {
            email: email,
            password: pwdDigest

        };
        return sendPostRequest(args, 'login');
    };

    let sendRegisterRequest = async (email, fName, lName, phone, country, gender, password, image) => {
        const pwdDigest = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256, password
        );
        let args = {
            email: email,
            firstName: fName,
            lastName: lName,
            phone: phone,
            password: pwdDigest,
            image: image,
            country: country,
            gender: gender,

        };
        return sendPostRequest(args, 'register');
    };

    let sendPostRequest = async (request, endpoint) => {
        try {
            const response = await fetch(config.backEndURL + endpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify(request),
            });
            return await response.json();
        } catch (e) {
            console.log(e);
            return undefined;
        }
    };

    let getCountriesList = async () => {
        try {
            const response = await fetch('http://country.io/names.json');
            return await response.json();
        } catch (e) {
            console.log(e);
            return undefined;
        }
    };

    let getImageUrl = function (imageId) {
        return config.backEndURL + 'image?id=' + imageId;
    };

    return {
        sendRegisterRequest: sendRegisterRequest,
        sendPostRequest: sendPostRequest,
        sendLoginRequest: sendLoginRequest,
        getCountriesList: getCountriesList,
        getImageUrl: getImageUrl,
        sendTransportDataRequest: sendTransportDataRequest,
        sendBusInformationRequest: sendBusInformationRequest,
        sendLocationRequest: sendLocationRequest,
        sendSummaryRequest: sendSummaryRequest,
        sendFareCalculateRequest: sendFareCalculateRequest,
        sendUserProfileRequest: sendUserProfileRequest,
    }
}())