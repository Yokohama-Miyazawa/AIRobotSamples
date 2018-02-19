#!/bin/bash
cd `dirname $0`
node sholder-server.js &
sudo node button-gpio.js
