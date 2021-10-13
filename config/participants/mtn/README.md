# mtn

mtn is a plain old DFSP simulator

Deployed for the Hipipo include everyone hackathon.

## Parties:

The following Parties are pre-registered along with mtn, and can be used to make transfers from.

### `MSISDN`
| Id Type | Id Value | participantId |Display Name |
| --- | --- | --- | --- |
| `MSISDN` | `256782447958`  | `mtn`   | Rodney Nkoba |

## Examples

Sending UGX from Rodney Nkoba - "MSISDN/256782447958" at mtn to Kuzimba at construction@kuzimba.com

> These examples are derived from [P2P Guide](http://sandbox.mojaloop.io/guides/payments/p2p-transfer-sync.html#peer-to-peer-transaction)

### Part 1 - Account Lookup

```bash
curl -X POST mtn-sdk-scheme-adapter-outbound.sandbox.mojaloop.io/transfers\
  -H 'Accept: application/json'\
  -H 'Content-Type: application/json'\
  -d '{
  "homeTransactionId": "c3b2e35c-f3ba-40e2-a13a-7e63b191cb5p",
  "from": {
    "idType": "MSISDN",
    "idValue": "256782447958"
  },
  "to": {
    "idType": "BUSINESS",
    "idValue": "construction@kuzimba.com"
  },
  "amountType": "RECEIVE",
  "currency": "UGX",
  "amount": "26428",
  "transactionType": "TRANSFER",
  "note": "Note sent to Payee."
}'
```


Get the TRANSFER_ID from the response here!

### Part 2 - Payee Accept

```bash
curl -X PUT mtn-sdk-scheme-adapter-outbound.sandbox.mojaloop.io/transfers/$TRANSFER_ID\
  -H 'Accept: application/json'\
  -H 'Content-Type: application/json'\
  -d '{
    "acceptParty": true
  }'

```

### Part 3 - Quote Accept
```bash
curl -X PUT mtn-sdk-scheme-adapter-outbound.sandbox.mojaloop.io/transfers/$TRANSFER_ID\
  -H 'Accept: application/json'\
  -H 'Content-Type: application/json'\
  -d '{
    "acceptQuote": true
  }'

```


### Increase net debit cap for UGX

```bash

curl -X PUT sandbox.mojaloop.io/api/admin/central-ledger/participants/mtn/limits\
 -H "Content-Type: application/json" \
 -d '{ "currency": "UGX", "limit": { "type": "NET_DEBIT_CAP", "value": 10000000000, "alarmPercentage": 10 }}'

```