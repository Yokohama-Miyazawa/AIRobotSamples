#!/bin/bash
cd `dirname $0`
node sholder.js &
sudo node button-gpio.js
