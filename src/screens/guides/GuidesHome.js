import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Icon, ActionSheet } from 'native-base';
import {Ionicons} from '@expo/vector-icons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';

var BUTTONS = [
    { text: "View Profile", icon: "person", iconColor: "#2c8ef4" },
    { text: "Message", icon: "chatbubbles", iconColor: "#2c8ef4" },
    { text: "Cancel", icon: "close", iconColor: "#25de5b" }
  ];
var DESTRUCTIVE_INDEX = 2;
var CANCEL_INDEX = 2;

/*
This page can be used to show user the Guides list 
*/

export default class GuidesHomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
          currentuserid: '', //current users username or id
          guides : [
                {
                  name: 'Nelson Watts',
                  avatar: 'https://randomuser.me/api/portraits/lego/5.jpg',
                  userid: 10,
                },
                {
                  name: 'Dorothy N. Mertz',
                  avatar: 'https://randomuser.me/api/portraits/lego/8.jpg',
                  userid: 17,
                },
                {
                  name: 'John S. Davis',
                  avatar: 'https://randomuser.me/api/portraits/lego/8.jpg',
                  userid: 13,
                },
                {
                  name: 'Joseph H. Beets',
                  avatar: 'https://randomuser.me/api/portraits/lego/8.jpg',
                  userid: 14,
                },
                {
                  name: 'Frank W. Bates',
                  avatar: 'https://randomuser.me/api/portraits/lego/8.jpg',
                  userid: 15,
                },
                {
                  name: 'Luther F. Preston',
                  avatar: 'https://randomuser.me/api/portraits/lego/8.jpg',
                  userid: 16,
                },
          ]
        };
      }

    guideClicked = (guideid) => {
      console.log(guideid)
        ActionSheet.show(
            {
              options: BUTTONS,
              cancelButtonIndex: CANCEL_INDEX,
              destructiveButtonIndex: DESTRUCTIVE_INDEX,
              title: "Travel Guides"
            },
            buttonIndex => {
              this.setState({ clicked: BUTTONS[buttonIndex] });
              //console.log(alert("Index '" +buttonIndex + "' Pressed!"))
              if(buttonIndex==1){
                this.props.navigation.navigate('Chat',{groupid: this.getAChatGroupId(guideid)});
              } 
            }
          )
    }

    getAChatGroupId = (guideid) => {
          //checks if chat group already available with current userid and guideid.
          //if group exists backened sends the available group id else sends a new group id
          try{
            // console.log("Get a chat group id Request sent to back end");
            // let response = await fetch(config.backEndURL + 'getAChatGroupID', {
            //   method: 'POST',
            //   headers: {
            //     Accept: 'application/json',
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({
            //     guideid: guideid,
            //     userid: this.state.currentuserid
            //   }),
            // });
            // let responseObj = JSON.parse(response._bodyText);
            
            // return responseObj.groupid;
            return 1234;
            
          } catch(e) {
            console.log(e);
          }
    }



  render() {
    return (
      <Container>

        <Content>
              <List dataArray={this.state.guides} renderRow={(item) =>
                  <ListItem thumbnail button onPress={() => this.guideClicked(item.userid)}>
                    <Left>
                      <Thumbnail source={{ uri: item.avatar }} />
                    </Left>
                    <Body>
                      <Text>{item.name}</Text>
                      <Text note numberOfLines={1}>Doing what you like will always keep you happy . .</Text>
                    </Body>
                    <Right style={{justifyContent: 'center'}} >
                      <Icon active name="chatbubbles"/>
                    </Right>
                  </ListItem>
              }>
            </List>
          </Content>

      </Container>
    );
  }
}