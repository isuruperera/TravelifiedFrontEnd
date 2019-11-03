import React, { Component } from 'react';
import { StyleSheet, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { Constants, Svg } from 'expo';
import {Container, Content, Header, Card, CardItem, Spinner, Icon, Button, View, Text} from 'native-base';
import getTheme from '../../theme/components';
import material from '../../theme/variables/material';
const config = require('../../config/config.json');


export default class RatingsProfile extends Component {

  windowWidth = Dimensions.get('window').width * (16/20);
  windowHeight = Dimensions.get('window').height * (16/20);
  sampleRatings = JSON.parse('{"status":"SUCCESS","userRatings":[{"category":"A","rating":4.0},{"category":"B","rating":3.8},{"category":"C","rating":3.0}]}')
  center = {x:this.windowWidth/2, y:this.windowWidth/2};
  ratingsSupportLines = [];
  ratingsPolygon = "";

  constructor(props) {
    super(props);
    this.state = {
        isLoading: true,
    }
  }


  componentDidMount() {
    this._loadProfileAsync();
  }

  async _loadProfileAsync() {
    this.ratingsPolygon= "";
    this.ratingsSupportLines = [];
    let response = await fetch(config.backEndURL + 'user/rating_profile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{"username":"10216489463407145"}',
    });
    let responseObj = JSON.parse(response._bodyText);
    console.log(responseObj);
    let ratingsList = responseObj.userRatings;
    console.log(ratingsList);
    for(var i=0;i<ratingsList.length;i++) {
      let rating = {
        category: ratingsList[i].category,
        rating: ratingsList[i].rating,
        ex: (this.windowWidth/2) * Math.cos((i*2*Math.PI/(ratingsList.length))) + this.windowWidth/2,
        ey: (this.windowWidth/2) * Math.sin((i*2*Math.PI/(ratingsList.length))) + this.windowWidth/2,
        rx: (ratingsList[i].rating/5) * (this.windowWidth/2) * Math.cos((i*2*Math.PI/(ratingsList.length))) + this.windowWidth/2,
        ry: (ratingsList[i].rating/5) * (this.windowWidth/2) * Math.sin((i*2*Math.PI/(ratingsList.length))) + this.windowWidth/2
      };
      this.ratingsSupportLines.push(rating);
    }
    for(var i=0;i<this.ratingsSupportLines.length;i++) {
      this.ratingsPolygon = this.ratingsPolygon + this.ratingsSupportLines[i].rx + "," + this.ratingsSupportLines[i].ry + " "
    }
    this.ratingsPolygon.trimRight();
    console.log(this.ratingsPolygon);
    this.state.isLoading = false;
    this.forceUpdate();
  }

  render() {
    if (this.state.isLoading) {
      return (
          <Container style = {{alignItems: 'center',alignSelf:'center'}}>
              <Header />
              <Content >
                  <Spinner color='blue' />
              </Content>
          </Container>
      );
      
  }
    return (
      <Container style = {{alignItems: 'center',alignSelf:'center', marginTop:this.windowHeight/8}}>
        <Content >
        <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isLoading}
                        onRefresh={() => this._loadProfileAsync()}
                    />
                }
            >
            <Svg
              height = {this.windowWidth}
              width= {this.windowWidth}
            >
              <Svg.Polygon
                points={this.ratingsPolygon}
                fill="blue"
                stroke="purple"
                strokeWidth="1"
              />
              <Svg.Circle
                cx={this.center.x}
                cy={this.center.y}
                r={5}
                fill="black"
              />
              {
                this.ratingsSupportLines.map((rating, index) => {
                  return (
                    <Svg.Line
                      x1={this.center.x}
                      y1={this.center.y}
                      x2={rating.ex}
                      y2={rating.ey}
                      stroke="black"
                      strokeWidth="2"
                      key={index}
                    />
                  )
                })
              }
              {
                this.ratingsSupportLines.map((rating, index) => {
                  return (
                    <Svg.Text
                      x={rating.rx}
                      y={rating.ry}
                      fontSize="15"
                      fontWeight="bold"
                      key={index}
                    > {rating.category + ": " +rating.rating } </Svg.Text>
                  )
                })
              }
            </Svg>
            </ScrollView>

        </Content>
        <Button full dark
                onPress = {() => {this.props.navigation.navigate('Home')}} >
                <Text>Back</Text>
              </Button>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
