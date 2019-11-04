const config = require('../config/config.json');
import * as Crypto from 'expo-crypto';


export default (function () {

    let getAllUsers = async (adminToken, id, username) => {
        let args = {
            adminToken: adminToken,
            id: id,
            username: username
        };
        return sendPostRequest(args, '/admin/getAllUsers');
    };

    let updateUserAdmin = async (adminToken, id, username, updateID, updateValue) => {
        let args = {
            adminToken: adminToken,
            id: id,
            username: username,
            updateID: updateID,
            updateValue: updateValue
        };
        return sendPostRequest(args, '/admin/updateUser');
    };

    let getAllEvents = async (adminToken, id, username) => {
        let args = {
            adminToken: adminToken,
            id: id,
            username: username
        };
        return sendPostRequest(args, '/admin/getAllEvents');
    };

    let updateEventAdmin = async (adminToken, id, username, updateID, updateValue) => {
        let args = {
            adminToken: adminToken,
            id: id,
            username: username,
            updateID: updateID,
            updateValue: updateValue
        };
        return sendPostRequest(args, '/admin/updateEvent');
    };

    let getAllServices = async (adminToken, id, username) => {
        let args = {
            adminToken: adminToken,
            id: id,
            username: username
        };
        return sendPostRequest(args, '/admin/getAllServices');
    };

    let updateServiceAdmin = async (adminToken, id, username, updateID, updateValue) => {
        let args = {
            adminToken: adminToken,
            id: id,
            username: username,
            updateID: updateID,
            updateValue: updateValue
        };
        return sendPostRequest(args, '/admin/updateService');
    };

    let addUserRating = async (userId, ratingUserId, adventurer, entertainer, friend, masterChef, animalLover) => {
        let args = {
            userId: userId,
            ratingUserId: ratingUserId,
            adventurer: adventurer,
            entertainer: entertainer,
            friendInNeed: friend,
            masterChef: masterChef,
            animalLover: animalLover
        };
        return sendPostRequest(args, 'addRating');
    };

    let updateEvent = async (userId, eventId, status) => {
        let args = {
            username: userId,
            eventId: eventId,
            status: status
        };
        return sendPostRequest(args, 'updateParticipation');
    };

    let getAllMyEvents = async (userId) => {
        let args = {
            userId: userId,
        };
        return sendPostRequest(args, 'getMyParticipatingEvents');
    };

    let getMyEvents = async (userId) => {
        let args = {
            userId: userId,
        };
        return sendPostRequest(args, 'getMyEvents');
    };

    let inviteFriend = async (eventId, userId) => {
        let args = {
            eventId: eventId,
            username: userId,
        };
        return sendPostRequest(args, 'addParticipation');
    };

    let getInvitableFriends = async (eventId, userId) => {
        let args = {
            eventId: eventId,
            userId: userId,
        };
        return sendPostRequest(args, 'getInvitableFriends');
    };

    let getEvent = async (eventId, userId) => {
        let args = {
            eventId: eventId,
            userId: userId,
        };
        return sendPostRequest(args, 'getEvent');
    };

    let addEvent = async (userId, eventName, eventDescription, photo, date, lng, lat) => {
        let args = {
            userId: userId,
            eventName: eventName,
            description: eventDescription,
            photo: photo,
            eventDate: date,
            longitude: lng,
            latitude: lat
        };
        return sendPostRequest(args, 'addEvent');
    };

    let getAllMyFriends = async (username) => {
        let args = {
            username: username
        };
        return sendPostRequest(args, 'getUserFriends');
    };

    let getAllServiceComments = async (serviceId) => {
        let args = {
            serviceId: serviceId
        };
        return sendPostRequest(args, 'getAllServiceComments');
    };

    let sendDiscoverAttaractionsRequest = async (longitude, latitude) => {
        let args = {
            longitude: longitude,
            latitude: latitude
        };
        return sendPostRequest(args, 'discoverTouristAttraction');
    };

    let sendDiscoverServiceRequest = async (longitude, latitude) => {
        let args = {
            longitude: longitude,
            latitude: latitude
        };
        return sendPostRequest(args, 'discoverTouristService');
    };

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

    let sendSummaryRequest = async (lng, lat) => {
        let args = {
            longitude: lng,
            latitude: lat
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

    let sendServiceRatingComment = async (userId, serviceId, rating, comment, photo) => {
        let args = {
            userId: userId,
            serviceId: serviceId,
            rating: rating,
            comment: comment,
            photo: photo
        };
        console.log(args);
        return sendPostRequest(args, 'addServiceComment');
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
        sendDiscoverAttaractionsRequest: sendDiscoverAttaractionsRequest,
        sendDiscoverServiceRequest: sendDiscoverServiceRequest,
        sendServiceRatingComment: sendServiceRatingComment,
        getAllServiceComments: getAllServiceComments,
        getAllMyFriends: getAllMyFriends,
        addEvent: addEvent,
        getEvent: getEvent,
        getInvitableFriends: getInvitableFriends,
        inviteFriend: inviteFriend,
        getMyEvents: getMyEvents,
        getAllMyEvents: getAllMyEvents,
        updateEvent: updateEvent,
        addUserRating: addUserRating,
        getAllUsers: getAllUsers,
        getAllEvents: getAllEvents,
        getAllServices: getAllServices,
        updateUserAdmin: updateUserAdmin,
        updateEventAdmin: updateEventAdmin,
        updateServiceAdmin: updateServiceAdmin,
    }
}())