/* main.c - Application main entry point */

/* Based on an example from Zephyr toolkit, modified by frank duignan
 * Copyright (c) 2015-2016 Intel Corporation
 *
 * SPDX-License-Identifier: Apache-2.0
 */
/* This example advertises three services:
 * 0x1800 Generic ACCESS (GAP)
 * 0x1801 Generic Attribute (GATT)
 * And a custom service 1-2-3-4-0 
 * This custom service contains a custom characteristic called char_value
 */
#define UGOCHUKWU_DEBUG

#include <zephyr/types.h>
#include <stddef.h>
#include <string.h>
#include <errno.h>
#include <zephyr/sys/printk.h>
#include <zephyr/sys/byteorder.h>
#include <zephyr/zephyr.h>

#include <zephyr/settings/settings.h>

#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <stdio.h>

#include "mydevice.h"

struct bt_conn *active_conn=NULL; // use this to maintain a reference to the connection with the central device (if any)

// ********************[ Start of characteristic ]**************************************
#define BT_UUID_TEMP_ID  	   BT_UUID_128_ENCODE(0x00002A1F, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
static struct bt_uuid_128 TEMP_id=BT_UUID_INIT_128(BT_UUID_TEMP_ID); // the 128 bit UUID for this gatt value
int16_t TEMP;
static ssize_t read_TEMP(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset);
static ssize_t read_TEMP(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset)
{
	printk("Got an TEMP read: %.2f\n",(float)(TEMP/100.0f));
	int16_t *value = &TEMP;
	return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(TEMP)); // pass the value back up through the BLE stack
	return 0;
}
// Callback that is activated when the characteristic is written by central
static ssize_t write_TEMP(struct bt_conn *conn, const struct bt_gatt_attr *attr,
			 const void *buf, uint16_t len, uint16_t offset,
			 uint8_t flags)
{
	uint8_t *value = attr->user_data;
	printk("Got an TEMP write\n");
	memcpy(value, buf, sizeof(TEMP)); // copy the incoming value in the memory occupied by our characateristic variable    
	return len;
}
// Arguments to BT_GATT_CHARACTERISTIC = _uuid, _props, _perm, _read, _write, _value
#define BT_GATT_TEMP BT_GATT_CHARACTERISTIC(&TEMP_id.uuid, BT_GATT_CHRC_READ | BT_GATT_CHRC_WRITE, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE , read_TEMP, write_TEMP, &TEMP)
// ********************[ End of characteristic ]**************************************

// ********************[ Service definition ]********************
#define BT_UUID_TEMP_SERVICE_VAL BT_UUID_128_ENCODE(0x0000180A, 0x0000, 0x1000, 0x8000, 0x00805F9B34FB)
static struct bt_uuid_128 my_TEMP_service_uuid = BT_UUID_INIT_128( BT_UUID_TEMP_SERVICE_VAL);
    
BT_GATT_SERVICE_DEFINE(my_TEMP_service_svc,
    BT_GATT_PRIMARY_SERVICE(&my_TEMP_service_uuid),
    BT_GATT_TEMP
);

// ********************[ Start of characteristic ]**************************************
#define BT_UUID_ACCEL_ID  	   BT_UUID_128_ENCODE(1, 2, 3, 4, (uint32_t)0x900)
static struct bt_uuid_128 ACCEL_id=BT_UUID_INIT_128(BT_UUID_ACCEL_ID); // the 128 bit UUID for this gatt value
//float ACCEL;
int16_t ACCEL;
static ssize_t read_ACCEL(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset);
static ssize_t read_ACCEL(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset)
{
	ACCEL;
	printk("Got an ACCEL read: %d\n", ACCEL);
	//float *value = &ACCEL;
	int16_t *value = &ACCEL;
	return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(ACCEL)); // pass the value back up through the BLE stack
	return 0;
}
// Callback that is activated when the characteristic is written by central
static ssize_t write_ACCEL(struct bt_conn *conn, const struct bt_gatt_attr *attr,
			 const void *buf, uint16_t len, uint16_t offset,
			 uint8_t flags)
{
	uint8_t *value = attr->user_data;
	printk("Got an ACCEL write\n");
	memcpy(value, buf, sizeof(ACCEL)); // copy the incoming value in the memory occupied by our characateristic variable    
	return len;
}
// Arguments to BT_GATT_CHARACTERISTIC = _uuid, _props, _perm, _read, _write, _value
#define BT_GATT_ACCEL BT_GATT_CHARACTERISTIC(&ACCEL_id.uuid, BT_GATT_CHRC_READ | BT_GATT_CHRC_WRITE, BT_GATT_PERM_READ | BT_GATT_PERM_WRITE , read_ACCEL, write_ACCEL, &ACCEL)
// ********************[ End of characteristic ]**************************************

// ********************[ Service definition ]********************
#define BT_UUID_ACCEL_SERVICE_VAL BT_UUID_128_ENCODE(1, 2, 3, 4, (uint32_t)0x9001)
static struct bt_uuid_128 my_ACCEL_service_uuid = BT_UUID_INIT_128( BT_UUID_ACCEL_SERVICE_VAL);
    
BT_GATT_SERVICE_DEFINE(my_ACCEL_service_svc,
    BT_GATT_PRIMARY_SERVICE(&my_ACCEL_service_uuid),
    BT_GATT_ACCEL
);

// ********************[ Advertising configuration ]********************
/* The bt_data structure type:
 * {
 * 	uint8_t type : The kind of data encoded in the following structure
 * 	uint8_t data_len : the length of the data encoded
 * 	const uint8_t *data : a pointer to the data
 * }
 * This is used for encoding advertising data
*/
/* The BT_DATA_BYTES macro
 * #define BT_DATA_BYTES(_type, _bytes...) BT_DATA(_type, ((uint8_t []) { _bytes }), sizeof((uint8_t []) { _bytes }))
 * #define BT_DATA(_type, _data, _data_len) \
 *       { \
 *               .type = (_type), \
 *               .data_len = (_data_len), \
 *               .data = (const uint8_t *)(_data), \
 *       }
 * BT_DATA_UUID16_ALL : value indicates that all UUID's are listed in the advertising packet
*/
// bt_data is an array of data structures used in advertising. Each data structure is formatted as described above
static const struct bt_data ad[] = {
	BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)), /* specify BLE advertising flags = discoverable, BR/EDR not supported (BLE only) */
	BT_DATA_BYTES(BT_DATA_UUID128_ALL, BT_UUID_TEMP_SERVICE_VAL /* A 128 Service UUID for the our custom service */),
};


// Callback that is activated when a connection with a central device is established
static void connected(struct bt_conn *conn, uint8_t err)
{
	if (err) {
		printf("Connection failed (err 0x%02x)\n", err);
	} else {
		printf("Connected\n");
		active_conn = conn;
	}
}
// Callback that is activated when a connection with a central device is taken down
static void disconnected(struct bt_conn *conn, uint8_t reason)
{
	printk("Disconnected (reason 0x%02x)\n", reason);
	active_conn = NULL;
}
// structure used to pass connection callback handlers to the BLE stack
static struct bt_conn_cb conn_callbacks = {
	.connected = connected,
	.disconnected = disconnected,
};
// This is called when the BLE stack has finished initializing
static void bt_ready(void)
{
	int err;
	printf("Bluetooth initialized\n");

// start advertising see https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/zephyr/reference/bluetooth/gap.html
/*
 * Excerpt from zephyr/include/bluetooth/bluetooth.h
 * 
 * #define BT_LE_ADV_CONN_NAME BT_LE_ADV_PARAM(BT_LE_ADV_OPT_CONNECTABLE | \
                                            BT_LE_ADV_OPT_USE_NAME, \
                                            BT_GAP_ADV_FAST_INT_MIN_2, \
                                            BT_GAP_ADV_FAST_INT_MAX_2, NULL)

 Also see : zephyr/include/bluetooth/gap.h for BT_GAP_ADV.... These set the advertising interval to between 100 and 150ms
 
 */
// Start BLE advertising using the ad array defined above
	err = bt_le_adv_start(BT_LE_ADV_CONN_NAME, ad, ARRAY_SIZE(ad), NULL, 0);
	if (err) {
		printf("Advertising failed to start (err %d)\n", err);
		return;
	}
	printf("Advertising successfully started\n");
}

void main(void)
{
	printf("Entering application\n");

	if(bt_enable(NULL)){
		printk("BT failed to enable");
		return;
	}

	bt_ready(); // This function starts advertising
	bt_conn_cb_register(&conn_callbacks);

	if(device_begin()){
		printk("i2c failed to enable");
		return;
	}

	uint8_t retval = 0;

	mydevice_readRegister(0x75, &retval);
	printf("WHO AM I: %x\n", retval);
	k_msleep(500);
	mydevice_writeRegister(0x6b, 0);

	while(1){
		// if millis() - last time > interval print else loop
		if(false){
		;
		}
		else{
		;
		}
		TEMP = (int16_t)(100 * get_temp());
		ACCEL = get_z_accel_raw();
		printf("temp: %f\n", (float)TEMP/100.0f);
		printf("raw accel: %d\n", ACCEL);
		printf("accel: %.2f\n", ACCEL/16384.0f);
		printf("\n");
		k_msleep(500);
	}
}
