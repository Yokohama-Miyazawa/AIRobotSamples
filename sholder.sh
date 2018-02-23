#!/bin/bash
cd `dirname $0`
node sholder-client.js &
sudo node button-gpio.js
