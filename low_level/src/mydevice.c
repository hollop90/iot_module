#include <zephyr/sys/printk.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/spi.h>
#include <zephyr/drivers/i2c.h>
#include <stdio.h>
#include <stdint.h>
#include <math.h>

#include "mydevice.h"

int16_t AC1;
int16_t AC2;
int16_t AC3;
uint16_t AC4;
uint16_t AC5;
uint16_t AC6;
int16_t B1;
int16_t B2;
int16_t MB;
int16_t MC;
int16_t MD;

int32_t X1;
int32_t X2;
int32_t B5;

static const struct device *i2c;
int device_begin()
{
	// Set up the I2C interface
	i2c = device_get_binding("I2C_1");
	if (i2c==NULL)
	{
		printf("Error acquiring i2c1 interface\n");
		return -1;
	}	
	return 0;
}
int mydevice_readRegister(uint8_t RegNum, uint8_t *Value)
{
	    //reads a byte from a specific register
    int nack;   
	nack=i2c_reg_read_byte(i2c,DEVICE_ADDRESS,RegNum,Value);
	return nack;
}

int mydevice_writeRegister(uint8_t RegNum, uint8_t Value)
{
	//writes a byte to a specific register
    uint8_t Buffer[2];    
    Buffer[0]= Value;    
    int nack;    
	nack=i2c_reg_write_byte(i2c,DEVICE_ADDRESS,RegNum,Value);
    return nack;
}

// int read_uint(uint8_t addr, uint16_t *value){
// 	//k_msleep(10);
// 	uint8_t MSB;
// 	uint8_t LSB;
// 
// 	if(mydevice_readRegister(addr, &MSB)){
// 		printf("ERROR: Failed to read uint16_t from register\n");
// 		return -1;
// 	}
// 	//printf("MSB: %x\n", MSB);
// 	addr += 1;
// 	k_msleep(10);
// 	if(mydevice_readRegister(addr, &LSB)){
// 		printf("ERROR: Failed to read uint16_t from register\n");
// 		return -1;
// 	}
// 	//printf("LSB: %x\n", LSB);
// 
// 	*value = (MSB<<8)|(LSB);
// 	return 0;
// }
// 
// int read_int(uint8_t addr, int16_t *value){
// 	k_msleep(10);
// 	uint8_t MSB;
// 	uint8_t LSB;
// 
// 	if(mydevice_readRegister(addr, &MSB)){
// 		printf("ERROR: Failed to read int16_t from register\n");
// 		return -1;
// 	}
// 	//printf("MSB: %x\n", MSB);
// 	addr += 1;
// 	k_msleep(10);
// 	if(mydevice_readRegister(addr, &LSB)){
// 		printf("ERROR: Failed to read int16_t from register\n");
// 		return -1;
// 	}
// 	//printf("LSB: %x\n", LSB);
// 
// 	*value = MSB<<8;
// 	*value = *value|LSB;
// 	return 0;
// }

float get_temp(){
	uint8_t retval = 0;
	int16_t temp = 0;
	float true_temp;

	mydevice_readRegister(0x41, &retval);
	temp = retval<<8;
	mydevice_readRegister(0x42, &retval);
	temp |= retval;

	true_temp = (float)temp/340 + 36.53;
	return true_temp;
}

int get_z_accel_raw(){
	uint8_t retval = 0;
	int16_t accel = 0;
	float true_accel;

	mydevice_readRegister(0x3f, &retval);
	accel = retval<<8;
	mydevice_readRegister(0x40, &retval);
	accel |= retval;

	return accel;
}

float get_z_accel(){
	uint8_t retval = 0;
	int16_t accel = 0;
	float true_accel;

	accel = get_z_accel_raw();

	true_accel = (float)(accel/16384);
	return true_accel;
}

