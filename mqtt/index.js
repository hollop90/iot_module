async function main() {
    // Impoort required modules
    const { Buffer } = require('node:buffer')
    const { createBluetooth } = require('node-ble') // API Docs: https://github.com/chrvadala/node-ble/blob/main/docs/api.md
    const { bluetooth, destroy } = createBluetooth() //this is the same as const bluetooth = (object returned by createBluetooth()).bluetooth; const destroy = (object returned by createBluetooth()).destroy;
    const mqtt = require('mqtt'); // API documentation: https://www.npmjs.com/package/mqtt

    const DEVICE_MAC = 'ED:C0:A4:E9:1A:58'

    // LED Service details
    const LED_SERVICE = '00000001-0002-0003-0004-000000003000'
    const LED_CHAR = '00000001-0002-0003-0004-000000003001'

    // Accelerometer Service details
    const ACCEL_SERVICE = "00000001-0002-0003-0004-000000000000"
    const ACCEL_CHAR_X = "00000001-0002-0003-0004-000000000001"
    const ACCEL_CHAR_Y = "00000001-0002-0003-0004-000000000002"
    const ACCEL_CHAR_Z = "00000001-0002-0003-0004-000000000003"

    const TOPIC_SUB = "package/control"
    const TOPIC_PUB = "package/log"

    //to work with personal instance on hivemq (assuming instance has been set up already with password and username as shown below)
    const OPTIONS = {
        username: 'sarajevo',
        password: 'Sarajev0',
        host: '880450a59920465f9ab1e122ea96bc54.s2.eu.hivemq.cloud',
        port: 8883,
        protocol: 'mqtts',
    };

    var mqttClient = mqtt.connect(OPTIONS);

    connectHandler = () => {
        console.log("Connected to MQTT Broker")
        mqttClient.subscribe(TOPIC_SUB, (err, granted) => {
            if (err){
                console.log("Error subscribing to '" + TOPIC_SUB + "'")
            } else {
                granted.forEach((elem) => {
                    console.log(elem)
                })
            }
        })
        message =  "Hello from Earth"
        mqttClient.publish(TOPIC_PUB, message, () => {
            console.log(`Publishing message '${message}' to topic '${TOPIC_PUB}'`)
        })
    }

    mqttClient.on("connect", connectHandler)

    // Get first available Bluetooth adapter
    const adapter = await bluetooth.defaultAdapter()

    // Enable Bluetooth discovery
    if (! await adapter.isDiscovering())
        await adapter.startDiscovery()

    // Connect to BBC MicroBit and its GATT server
    // The GATT server allows us to exchange data with the device by reading/writing to its characteristics and services
    const device = await adapter.waitDevice(DEVICE_MAC)
    device.connect()
    const gattServer = await device.gatt()

    // Get the LED Service and it's corrosponding characteristic
    const ledService = await gattServer.getPrimaryService(LED_SERVICE)
    const ledChar = await ledService.getCharacteristic(LED_CHAR)

    // Get the Accelerometer Service and it's corrosponding characteristic
    // In this project we will only use the Z axis characteristic
    const accelService = await gattServer.getPrimaryService(ACCEL_SERVICE)
    const accelCharZ = await accelService.getCharacteristic(ACCEL_CHAR_Z)

    // A Buffer object to store the values written to and read from the BBC MicroBit
    // Buffers store the raw bytes in memory with not indication as to what that data actually represents
    // it is the responsibility of the programmer to interpret these bytes
    let buffer = new Buffer.from([0])

    // Blink the LED to show that things are running OK
    ledChar.writeValue(new Buffer.from([1])) // Write a 1 to the LED characteristic

    // Read and log the value of the LED characteristic
    buffer = await ledChar.readValue()
    console.log(buffer)

    await new Promise((resolve) => { setTimeout(resolve, 200) }) //delay for 2 seconds
    ledChar.writeValue(new Buffer.from([0])) // Write a 0 to the LED characteristic

    // Read and log the value of the LED characteristic
    buffer = await ledChar.readValue()
    console.log(buffer)

    // Begin our asset tracking application
    // We will use the accelerometer to measure the orientatoin of a package
    // Depending on the orientaion of the package we will:
    //  Report that everything is "OK"
    //  Report that the package is slightly tilted with a "WARN"
    //  Report that something is seriouslt wrong with an "ERROR" and turn on the LEDs
    let index = 0
    let package_reset = false

    mqttClient.on("message", (topic, payload, packet) => {
        console.log(`Recieved message "${String(payload)}'`)
        if (String(payload) == "reset")
            package_reset = true
    })

    while (true) {
        console.log("Loop iteration: " + index)
        buffer = await accelCharZ.readValue()
        value = buffer.readInt32LE() * -1
        console.log(value)

        if (value > 800) {
            package_orientation = "Orientation: OK"
        } else if (value > 500 && value < 800) {
            package_orientation = "Orientation: WARN"
        } else {
            package_orientation = "Orientation: ERROR"
            ledChar.writeValue(new Buffer.from([1]))
        }

        if (package_reset){
            await ledChar.writeValue(new Buffer.from([0]))
            mqttClient.publish(TOPIC_PUB, "package deleiverd")
            break
        }

        console.log(package_orientation)
        mqttClient.publish(TOPIC_PUB, package_orientation)
        await new Promise((resolve) => setTimeout((resolve), 500))//delay for 2 seconds
        index++
    }

    destroy()
    mqttClient.end()
}

main().then().catch(console.error)
