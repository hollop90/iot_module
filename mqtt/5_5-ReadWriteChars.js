const deviceOfInterest = 'ED:C0:A4:E9:1A:58'
const serviceOfInterestUuid = '00000001-0002-0003-0004-000000003000' //uuid of LED service
const characteristicOfInterestUuid = '00000001-0002-0003-0004-000000003001' //uuid of read/write characteristic of LED service

const accelService = "00000001-0002-0003-0004-000000000000"

const accelCharX = "00000001-0002-0003-0004-000000000001"
const accelCharY = "00000001-0002-0003-0004-000000000002"
const accelCharZ = "00000001-0002-0003-0004-000000000003"

const main = async () => {
  const { Buffer } = require('node:buffer')
  const { createBluetooth } = require('node-ble')
  const { bluetooth, destroy } = createBluetooth() //this is the same as const bluetooth = (object returned by createBluetooth()).bluetooth; const destroy = (object returned by createBluetooth()).destroy;

  // get bluetooth adapter
  const adapter = await bluetooth.defaultAdapter() //get an available Bluetooth adapter
  await adapter.startDiscovery() //using the adapter, start a device discovery session
  console.log('discovering')

  // look for a specific device
  const device = await adapter.waitDevice(deviceOfInterest)
  console.log('got device', await device.getAddress())
  const deviceName = await device.getName()
  console.log('got device remote name', deviceName)
  console.log('got device user friendly name', await device.toString())
  await adapter.stopDiscovery()
  await device.connect()
  console.log("connected to device : " + deviceName)

  const gattServer = await device.gatt()
  services = await gattServer.services()
  console.log("services are " + services)

  if (services.includes(accelService)) { //uuid of service
    console.log('got the LED service')
    const primaryService = await gattServer.getPrimaryService(accelService)
    const ledService = await gattServer.getPrimaryService(serviceOfInterestUuid)
    chars = await primaryService.characteristics()
    console.log("the service characteristics are : " + chars)

    console.log("uuid of accel_x is : " + accelCharZ)
    charact = await primaryService.getCharacteristic(accelCharZ)
    ledChar = await ledService.getCharacteristic(characteristicOfInterestUuid)
    console.log("characteristic flags are : " + await charact.getFlags())
    cval = await charact.readValue()
    buf = Buffer.from(cval)
    console.log(buf.readInt32LE(0)) // Accel val is a 32bit integer sent in LE ranging from -1024 to +1024
    console.log("characteristic value is : " + (await charact.readValue()))
    console.log("characteristic value is : " + (await charact.readValue()))
    console.log("characteristic value is : " + (await charact.readValue()))
    console.log("characteristic value is : " + (await charact.readValue()))

    await ledChar.writeValue(new Buffer.from([1])) //write to LED characteristic to turn LED on
    console.log("LED is on")
    await new Promise(resolve => setTimeout(resolve, 200));//delay for 2 seconds
    await ledChar.writeValue(new Buffer.from([0])) //write to LED characteristic to turn LED on
    console.log("LED is off")
  }

  await device.disconnect()
  console.log('disconnected')
  process.exit()
}

main()
  .then()
  .catch(console.error)

