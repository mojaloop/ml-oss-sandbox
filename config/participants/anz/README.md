# anz

ANZ is a dfsp we created for the ANZ team of the MAS CDBC Hackathon.

## Details:

- `baseUrl`: `anz-sdk-scheme-adapter-outbound.sandbox.mojaloop.io`

## Parties:

The following Parties are pre-registered along with ANZ, and can be used to make transfers from.

#### `MSISDN`
| Id Type | Id Value | participantId |Display Name |
| --- | --- | --- | --- |
| `MSISDN` | `9579347902`  | `anz`   | Greg Smith |
| `MSISDN` | `9348092311`  | `anz`   | Sebastian Mark |
| `MSISDN` | `2390842092`  | `anz`   | Alice Alison |

#### `ALIAS`

| Id Type | Id Value | participantId |Display Name |
| --- | --- | --- | --- |
| `ALIAS` | `000332`       | `jcash`   | Ju Fen |
| `ALIAS` | `alice@me.com` | `jcash`   | Alice Alison |


## Examples

ANZ wanted to be able to send transfers without waiting for party acceptance
or quote confirmation, so we configured the `AUTO_ACCEPT_PARTIES` and 
`AUTO_ACCEPT_QUOTES` to `true` in  `values.yaml#sdk_scheme_adapter`

### Send transfer from ANZ -> JCash

Send 1000 PHP from `MSISDN/9579347902` to `MSISDN/329294234`. 

```bash
curl -X POST anz-sdk-scheme-adapter-outbound.sandbox.mojaloop.io/transfers\
  -H 'Accept: application/json'\
  -H 'Content-Type: application/json'\
  -d '{
  "homeTransactionId": "c3b2e35c-f3ba-40e2-a13a-7e63b191cb5e",
  "from": {
    "idType": "MSISDN",
    "idValue": "9579347902"
  },
  "to": {
    "idType": "MSISDN",
    "idValue": "329294234"
  },
  "amountType": "RECEIVE",
  "currency": "PHP",
  "amount": "1000",
  "transactionType": "TRANSFER",
  "note": "Note sent to Payee."
}'
```