# Dash

Dash is a sub-project for building out a simple DFSP and Hub user interface 

It's not intended for a production system, but is more suitable to a user who wants
to learn more about running Mojaloop.


For now, this is a collection of curl examples that demonstrate which API calls to make
to get to important information on the Hub.

### Hub Operator:

- list hub accounts
```bash
curl beta.moja-lab.live/api/admin/central-ledger/participants/Hub       
```

```json
{
  "name": "Hub",
  "id": "central-ledger.local/participants/Hub",
  "created": "\"2021-03-09T03:26:45.000Z\"",
  "isActive": 1,
  "links": {
    "self": "central-ledger.local/participants/Hub"
  },
  "accounts": [
    {
      "id": 1,
      "ledgerAccountType": "HUB_MULTILATERAL_SETTLEMENT",
      "currency": "USD",
      "isActive": 1,
      "createdDate": null,
      "createdBy": "unknown"
    },
    {
      "id": 2,
      "ledgerAccountType": "HUB_RECONCILIATION",
      "currency": "USD",
      "isActive": 1,
      "createdDate": null,
      "createdBy": "unknown"
    }
  ]
}
```


- see currency [done]
- visualize transfers in realtime
- visualize a settlement process? [stretch]


### Participants
- see a list of participants

```bash
curl beta.moja-lab.live/api/admin/central-ledger/participants
```


```json
{
    "name": "applebank",
    "id": "central-ledger.local/participants/applebank",
    "created": "\"2021-03-09T04:07:58.000Z\"",
    "isActive": 1,
    "links": {
      "self": "central-ledger.local/participants/applebank"
    },
    "accounts": [
      {
        "id": 9,
        "ledgerAccountType": "POSITION",
        "currency": "USD",
        "isActive": 1,
        "createdDate": null,
        "createdBy": "unknown"
      },
      {
        "id": 10,
        "ledgerAccountType": "SETTLEMENT",
        "currency": "USD",
        "isActive": 1,
        "createdDate": null,
        "createdBy": "unknown"
      }
    ]
  },
```

- see participant limits
- see registered callback endpoints
- see net debit cap, reserved funds
```bash
curl beta.moja-lab.live/api/admin/central-ledger/participants/pisp
curl beta.moja-lab.live/api/admin/central-ledger/participants/pisp/endpoints
curl beta.moja-lab.live/api/admin/central-ledger/participants/pisp/limits
curl beta.moja-lab.live/api/admin/central-ledger/participants/pisp/positions

```


### Oracles/Parties
- see a list of the oracles registered

```bash
curl beta.moja-lab.live/api/admin/account-lookup-service-admin/oracles \
  -H "Content-Type: application/json" \
  -H "Date: 2021-01-01"
```

```json
[
  {
    "oracleId": 1,
    "oracleIdType": "MSISDN",
    "endpoint": {
      "value": "http://beta.moja-lab.live/api/admin/oracle-simulator/oracle",
      "endpointType": "URL"
    },
    "currency": "USD",
    "isDefault": 1
  }
]
```

- See a list of the participants and parties registered in the oracle

... hmm, that's going to be hard to do, we'd need to expose the Oracle Simulator.
It might be easier to create a new oracle from scratch!

Maybe we can use the Consents oracle instead, and expose it's DB through retool.


- If the DFSP is a simulator, get the value for the parties in a static page

... how might

- (stretch): register new parties!
