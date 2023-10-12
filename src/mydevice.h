#include <stdio.h>
#include <stdint.h>
#define DEVICE_ADDRESS (0x77)

int device_begin();

int mydevice_readRegister(uint8_t RegNum, uint8_t *Value);

int mydevice_writeRegister(uint8_t RegNum, uint8_t Value);
