var mqtt = require('mqtt'); // API documentation: https://www.npmjs.com/package/mqtt
// var topicToSubscribeTo = "iot_topic/accel"
// var topicToPublishTo = "iot_topic/accel"
var topicToSubscribeTo = "package/log"
var topicToPublishTo = "package/log"

//to work with personal instance on hivemq (assuming instance has been set up already with password and username as shown below)
const options = {
  username: 'sarajevo',
  password: 'Sarajev0',
  host: '880450a59920465f9ab1e122ea96bc54.s2.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
};

var mqttClient = mqtt.connect(options);
console.log("HHH")
