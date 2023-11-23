#ifndef UGO_LIB
#define UGO_LIB

#include <stdio.h>
#include <stdint.h>
#define DEVICE_ADDRESS (0x68) //mpu6050
//#define DEVICE_ADDRESS (0x52) // rv3028

int device_begin();

int mydevice_readRegister(uint8_t RegNum, uint8_t *Value);

int mydevice_writeRegister(uint8_t RegNum, uint8_t Value);

// Read the calibration values
extern int16_t AC1;
extern int16_t AC2;
extern int16_t AC3;
extern uint16_t AC4;
extern uint16_t AC5;
extern uint16_t AC6;
extern int16_t B1;
extern int16_t B2;
extern int16_t MB;
extern int16_t MC;
extern int16_t MD;

extern int32_t X1;
extern int32_t X2;
extern int32_t B5;

int read_int(uint8_t addr, int16_t *value);
int read_uint(uint8_t addr, uint16_t *value);

int fetch_cali_vals();

uint16_t get_raw_temp();
float get_temp();

void calc_constants(uint16_t UT);

int get_z_accel_raw();
float get_z_accel();
#endif
