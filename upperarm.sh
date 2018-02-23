#!/bin/bash
cd `dirname $0`
node upperarm-client.js &
sudo node button-gpio.js
