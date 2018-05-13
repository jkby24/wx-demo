//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        info:{
          phone:"0591-23433299",
          position:{
            title:"大梦山游泳馆",
            latitude: 26.088291,
            longitude: 119.283867,
          }
        },
        movies:[    
            {index:0,url:'./images/1.jpg'} ,      
            {index:1,url:'./images/2.jpg'} ,      
            {index:2,url:'./images/3.jpg'} ,  
            {index:3,url:'./images/4.jpg'} ,  
            {index:4,url:'./images/5.jpg'} ,  
        ],
        markers: [{
          // iconPath: "/resources/others.png",
          // label:{
          //   content: "大梦山"
          // },
          // callout:{
          //   color:"red"
          // },
          id: 0,
          latitude: 26.088291,
          longitude: 119.283867,
        }]
    },
    onLoad: function () {
    }, 
    call:function(){
      wx.makePhoneCall({
        phoneNumber: this.data.info.phone
      })
    },
    go: function () {
      wx.openLocation({
        latitude: this.data.info.position.latitude,
        longitude: this.data.info.position.longitude,
        name: this.data.info.position.name,
        scale: 28
      }) 
    },
})
