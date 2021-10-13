# stanbic

stanbic is a plain old DFSP simulator

Deployed for the Hipipo include everyone hackathon.

## Parties:

The following Parties are pre-registered along with stanbic, and can be used to make transfers from.

### `BUSINESS`
| Id Type | Id Value | participantId |Display Name |
| --- | --- | --- | --- |
| `BUSINESS` | `construction@kuzimba.com`  | `stanbic`   | Kuzimba |

### Increase net debit cap for UGX

```bash

curl -X PUT sandbox.mojaloop.io/api/admin/central-ledger/participants/stanbic/limits\
 -H "Content-Type: application/json" \
 -d '{ "currency": "UGX", "limit": { "type": "NET_DEBIT_CAP", "value": 10000000000, "alarmPercentage": 10 }}'

```