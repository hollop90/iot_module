//MQTT broker dashboard available at http://www.hivemq.com/demos/websocket-client/
var mqtt = require('mqtt'); // API documentation: https://www.npmjs.com/package/mqtt
var topicToSubscribeTo = "iot_topic/accel"
var topicToPublishTo = "iot_topic/accel"

//to work with personal instance on hivemq (assuming instance has been set up already with password and username as shown below)
const options = {
  username: 'sarajevo',
  password: 'Sarajev0',
  host: '880450a59920465f9ab1e122ea96bc54.s2.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
};

var mqttClient = mqtt.connect(options);

//event handler function 
function connectedToBrokerEventHandler() {
  console.log("connected to MQTT broker");
  mqttClient.subscribe(topicToSubscribeTo, subscribeCallback); /* sample3 MQTT code */
  mqttClient.publish(topicToPublishTo, 'accel values from microbit will eventually appear here (hopefully!)', publishCallback);
}

//subscribe callback function - this is called when a topic has been subscribed to
function subscribeCallback(error, granted) {
  if (error) {
    console.log("error subscribing to topic");
  } else {
    console.log("subscrited to messages on topic : ")
    for (var i = 0; i < granted.length; i++) {
      console.log(granted[i]);
    }
  }
}

//event handler function 
function messageEventHandler(topic, message, packet) {
  console.log("Received message'" + message + "' on topic '" + topic + "'");
}

//publish callback function - this is called when the message has been published
function publishCallback(error) {
  if (error) {
    console.log("error publishing data");
  } else {
    console.log("Message is published to topic '" + topicToPublishTo + "'");
    //mqttClient.end(); // Close the connection when published - don't want to call this if awaiting messages from the broker
  }
}

console.log("starting MQTT Client on the gateway device to publish and subscribe to messages to and from the broker for 2021/22");
console.log("writing to " + topicToSubscribeTo)

//binding a MQTT 'connect' event and event handler handler, when a 'connect' event is raised the event handler function connectedToBrokerCallback is called
mqttClient.on('connect', connectedToBrokerEventHandler);

//binding a MQTT 'message' event and event handler handler, when a message arrives from the broker the event handler function messageEventHandler is called
mqttClient.on('message', messageEventHandler);


