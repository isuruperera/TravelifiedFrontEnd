import React, { Component } from 'react';
import { View, KeyboardAvoidingView } from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { Button, Text, Container, Content, Picker, ListItem,Label, Icon, Card, CardItem, Item, Body, Right, Input, Form, Textarea, Left, Root} from 'native-base';
const config = require('../../config/config.json');

/*
This page can be used to edit chat groups.
*/

const items = [

  {
    name: 'Friends',
    username: 0,
    // users friends list will be here to create a group with
    children: [
      {
        name: 'Jean D. Taylor',
        username: 10,
      },
      {
        name: 'Dorothy N. Mertz',
        username: 17,
      },
      {
        name: 'John S. Davis',
        username: 13,
      },
      {
        name: 'Joseph H. Beets',
        username: 14,
      },
      {
        name: 'Frank W. Bates',
        username: 15,
      },
      {
        name: 'Luther F. Preston',
        username: 16,
      },
    ],
  }

];

export default class EditGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: [], //Selected friends list already in the group
      chatGroupId: this.props.navigation.state.params.groupid, //Random ID will be generated as the Group ID
      groupTitle: "", 
      category: "",
      created_by: "", //User who's creating the group (Admin)
      username: "" //user who's accessing now (Viewing this page)
    };
    this.getGroupData();
    this.getUsersFriendsList();
    
  }
  
  onSelectedItemsChange = (selectedUsers) => {
    this.setState({ selectedUsers });
  };

  onEditGroup(){
    alert(this.state.selectedUsers)
    console.log(this.state.selectedUsers)
    this._editGroup();
    
  }

  getGroupData = async () => {
    try{
        console.log("Get groups data from groupid request sent to back end");
        let response = await fetch(config.backEndURL + 'getGroupInfo', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({chatGroupId: this.state.chatGroupId}),
        });
        let responseObj = JSON.parse(response._bodyText);

        this.setState({
            selectedUsers:responseObj.currentUsersList,
            category: responseObj.category,
            groupTitle: responseObj.groupTitle,
            created_by: responseObj.created_by,
            username: responseObj.username
        });

        console.log(responseObj)
        
      } catch(e) {
        console.log(e);
      }
  }

  //Send request to the backend to get the users friends list
  getUsersFriendsList = async () => {
    try{
      console.log("Get users friends list Request sent to back end");
      let response = await fetch(config.backEndURL + 'getUserFriends', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: this.state.username}),
      });
      let responseObj = JSON.parse(response._bodyText);
      
        console.log(responseObj.userFriendList);
        console.log(items)

        //items[0].children.splice(0,1)

        responseObj.userFriendList.forEach(element => {
          element.name = element.fullname;
          delete element.fullname;
          items[0].children.push(element)
          this.forceUpdate();
        });
        console.log(items)
        this.forceUpdate();
      
    } catch(e) {
      console.log(e);
    }
  }

//Sends details of the group that needs to be edited to the backend
  _editGroup = async () => {
    try{
      console.log("Edit Group Request sent to back end");
      let response = await fetch(config.backEndURL + 'editGroup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      });
      let responseObj = JSON.parse(response._bodyText);
        console.log(responseObj);
      
    } catch(e) {
      console.log(e);
    }
  }

  render() {

    return (
      <Container>
        <Content>
          <Card>
          <KeyboardAvoidingView behavior="padding">
            <CardItem>
                <Item > 
                  <Label>Creator</Label>
                  <Input 
                      value={this.state.created_by}
                      disabled
                  />
                </Item>
            </CardItem>
            <CardItem>
                <Item > 
                  <Label>Group ID</Label>
                  <Input 
                      value={this.state.chatGroupId}
                      disabled
                  />
                </Item>
            </CardItem>
            <CardItem>
                <Item > 
                  <Label>Group Title</Label>
                  <Input
                      onChangeText={ (groupTitle) => this.setState({groupTitle}) }
                      value={this.state.groupTitle}
                  />
                </Item>
            </CardItem>
            <CardItem>
                <Item > 
                  <Label>Category</Label>
                  <Input
                      onChangeText={ (category) => this.setState({category}) }
                      value={this.state.category}
                  />
                </Item>
            </CardItem>
              <View>
                <SectionedMultiSelect
                  items={items}
                  uniqueKey="username"
                  subKey="children"
                  selectText="Select friends to add to the chat..."
                  showDropDowns={false}
                  readOnlyHeadings={true}
                  onSelectedItemsChange={this.onSelectedItemsChange}
                  selectedItems={this.state.selectedUsers}
                />
              </View>
              
            <CardItem> 
                <Body>
                    <Button full rounded primary onPress = {() => {this.onEditGroup()}}>
                    <Text>Edit Group</Text>
                    </Button>
                </Body>
            </CardItem>
            </KeyboardAvoidingView>
          
     
      </Card>
        </Content>
      </Container>
    );
  }
}

