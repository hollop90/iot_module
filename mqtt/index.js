async function main() {
    // Impoort required modules
    const { Buffer } = require('node:buffer')
    const { createBluetooth } = require('node-ble') // API Docs: https://github.com/chrvadala/node-ble/blob/main/docs/api.md
    const { bluetooth, destroy } = createBluetooth() //this is the same as const bluetooth = (object returned by createBluetooth()).bluetooth; const destroy = (object returned by createBluetooth()).destroy;
    const { mqtt } = require('mqtt'); // API documentation: https://www.npmjs.com/package/mqtt

    const DEVICE_MAC = 'ED:C0:A4:E9:1A:58'

    // LED Service details
    const LED_SERVICE = '00000001-0002-0003-0004-000000003000'
    const LED_CHAR = '00000001-0002-0003-0004-000000003001'

    // Accelerometer Service details
    const ACCEL_SERVICE = "00000001-0002-0003-0004-000000000000"
    const ACCEL_CHAR_X = "00000001-0002-0003-0004-000000000001"
    const ACCEL_CHAR_Y = "00000001-0002-0003-0004-000000000002"
    const ACCEL_CHAR_Z = "00000001-0002-0003-0004-000000000003"

    // Get first available Bluetoothe adapter
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
    for (let index = 0; index < 10; index++) {
        console.log("Loop iteration: " + index)
        buffer = await accelCharZ.readValue()
        value = buffer.readInt32LE()*-1
        console.log(value)

        if (value > 800){
            console.log("Orientation: OK")
            ledChar.writeValue(new Buffer.from([0]))
        } else if (value > 500 && value < 800){
            console.log("Orientation: WARN")
            ledChar.writeValue(new Buffer.from([0]))
        } else {
            console.log("Orientation: ERROR")
            ledChar.writeValue(new Buffer.from([1]))
        }
        await new Promise((resolve) => setTimeout((resolve), 500))//delay for 2 seconds
    }

    destroy()
    process.exit()
}

main().then().catch(console.error)
