#!/usr/bin/env bash


set -u

echo "TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}" > /tmp/twilio_secret

kubectl create secret generic twilio-env --from-env-file=/tmp/twilio_secret

rm -rf /tmp/twilio_secret