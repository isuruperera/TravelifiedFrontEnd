import React from 'react'
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { 
  View,
  Text,
  KeyboardAvoidingView,
} from "react-native";
const config = require('../../config/config.json');

/*
This is the chat screen. It shows all the messages in a group. 
If we insert all the messages to the messages field in the given format messages will be shown in this page.
*/ 

export default class ChatScreen extends React.Component {
  state = {
    messages: [], //All the messages
    bId: 1234, 
    groupid: this.props.navigation.state.params.groupid,
    firstName: 'Nadun', //Current user details
    lastName: 'Kulatunge',
    email: 'nadun@email.com',
    picture: 'https://randomuser.me/api/portraits/lego/5.jpg',
    fbToken: '1029'
  }

  componentWillMount() {
    alert(this.props.navigation.state.params.groupid)
    this.setState({
      messages: [
        {
          _id: 4,  //message id should be unique for each message
          text: 'My fourth message',
          createdAt: new Date(), //or createdAt: new Date()
          user: {
            _id: 3, //users id
            name: 'User Name 2',
            avatar: 'https://randomuser.me/api/portraits/lego/5.jpg',
          }
        },
        {
          _id: 3,  
          text: 'My third message',
          createdAt: new Date(), 
          image: 'https://randomuser.me/api/portraits/lego/2.jpg',
          user: {
            _id: 3, //users id
            name: 'User Name 2',
            avatar: 'https://randomuser.me/api/portraits/lego/5.jpg',
          }
        },
        {
          _id: 2,  
          text: 'My second message',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'User Name1',
            avatar: 'https://randomuser.me/api/portraits/lego/8.jpg',
          },
        },
        {
          _id: 1,  
          text: 'My first message',
          createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
          user: {
            _id: 1,
            avatar: 'https://randomuser.me/api/portraits/lego/3.jpg',
          }
        },
      ],
    })

    /* //Server Response single message
    {
      "_id": 5,
      "createdAt": "2019-09-01T05:15:19.391Z",
      "text": "Message from the server",
      "user": {
          "_id": 2,
          "avatar": "https://randomuser.me/api/portraits/lego/8.jpg",
          "name": "User Name 1"
      }
    }
    */

    /* Multiple Messages
      [{
        "_id": 5,
        "createdAt": "2019-09-01T05:15:19.391Z",
        "text": "Message from the server2",
        "user": {
            "_id": 2,
            "avatar": "https://randomuser.me/api/portraits/lego/8.jpg",
            "name": "User Name 1"
        }
      },{
        "_id": 6,
        "createdAt": "2019-09-01T05:15:19.391Z",
        "text": "Message from the server",
        "user": {
            "_id": 2,
            "avatar": "https://randomuser.me/api/portraits/lego/8.jpg",
            "name": "User Name 1"
        }
      }]
    */
   this._getMessages()
    //this.timer = setInterval(()=> this._getMessages(), 5000)
  }

  _getMessages = async () => {
    try{
      console.log("Registration Request sent to back end");
      let response = await fetch(config.backEndURL + 'messages', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      });
      let responseObj = JSON.parse(response._bodyText);
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, responseObj),
      }))
        console.log(responseObj);
      
    } catch(e) {
      console.log(e);
    }
  }

  onSend(messages = []) { 
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  renderBubble = (props) => {
    if (props.isSameUser(props.currentMessage, props.previousMessage) && props.isSameDay(props.currentMessage, props.previousMessage )) {
        return (
            <Bubble
                {...props}
            />
        );
    } 
    return (
        <View>
            <Text style={{marginLeft:5, color: 'grey'}}>{props.currentMessage.user.name}</Text> 
            <Bubble
            {...props}
            />
        </View>
    );
    
}

  render() {
    return (
      <View style={{flex:1}}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          renderAvatarOnTop = {true}
          renderBubble={this.renderBubble}
          user={{
            _id: 1, //current users id should be here
          }}
        />
        <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={80}/>
      </View>
    )
  }
}