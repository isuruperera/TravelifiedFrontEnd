import React, { Component } from 'react';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Icon, ActionSheet, Badge } from 'native-base';
import {Ionicons} from '@expo/vector-icons';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import Moment from 'moment';

/*
This page contains all the messages user has recieved and when the user clicks on a message 
the person will be taken to the ChatScreen with its GroupID
*/

export default class MyConversations extends Component {
    constructor(props) {
        super(props);
        this.state = {
          conversations : [
                {
                  groupid: "1111111111",
                  groupTitle: 'Sample Title',
                  category: 'Some Category',
                  time: '2019-09-01'
                },
                {
                  groupid: "1111111112",
                  groupTitle: 'Sample Title2',
                  category: 'Some Category2',
                  time: '2019-09-02',
                }
          ]
        };
      }

      conversationClicked = (groupid) => {
        alert(groupid);
      }

  render() {
    return (
      <Container>
        <Content>
          <List dataArray={this.state.conversations} renderRow={(item) =>
              <ListItem thumbnail button onPress={() => this.conversationClicked(item.groupid)}>
                <Left>
                  <Ionicons style={{color: 'rgba(0,0,0,0.5)'}} name='ios-chatbubbles' size={responsiveFontSize(4)}/>
                </Left>
                <Body>
                  <Text>{item.groupTitle}</Text>
                  <Text note numberOfLines={1}>Category: {item.category}</Text>
                </Body>
                <Right>
                  <Ionicons style={{color: 'rgba(0,0,0,0.5)'}} name='md-settings' size={responsiveFontSize(2)} 
                    button onPress={() => this.props.navigation.navigate('EditGroup',  { 
                    groupid: item.groupid})
                  }/>
                </Right>
              </ListItem>
          }>
          </List>
        </Content>
      </Container>
    );
  }
}