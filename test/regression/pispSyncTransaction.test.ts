import axios, { AxiosRequestConfig } from 'axios'
import { v4 } from 'uuid'

const baseUrl = 'sandbox.mojaloop.io'
const paynowSyncAPI = `http://paynow-thirdparty-scheme-adapter-outbound.${baseUrl}`

jest.setTimeout(10 * 1000)

describe('pisp sync API', () => {
  const config: AxiosRequestConfig = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }


  // Shared state for these flow.
  // Each has it's own describe block to ensure tests run in order
  describe('pisp <---> bankone happy path transfer', () => {
    // Hardcode a thirdparty account link for user's phone +61414414415
    // ideally, we would implement a GET somewhere so we dont
    // need to hardcode
    const thirdpartyLinkAccountId = 'd587a980eb3f323df27034619d11198'
    const transactionRequestId = v4()
    let lookupResponse: any
    let authorizationResponse: any


    describe('looks up a destination party', () => {
      it('', async () => {
        /*
        curl -X POST "http://sandbox.mojaloop.io/switch-ttk-backend/thirdpartyTransaction/partyLookup" \
          -H  "accept: application/json" \
          -H  "Content-Type: application/json" \
          -d '{
            "transactionRequestId": "b51ec534-ee48-4575-b6a9-ead2955b8069",
            "payee": {
              "partyIdType": "MSISDN",
              "partyIdentifier":"16135551212"
            }
          }'
        */

        // Arrange
        const uri = `${paynowSyncAPI}/thirdpartyTransaction/partyLookup`
        const data = {
          transactionRequestId,
          payee: {
            partyIdType: "MSISDN",
            partyIdentifier: "11194979"
          }
        }
        const expected = {
          "currentState": "partyLookupSuccess",
          "party": {
            "name": "Alex Alligator",
            "partyIdInfo": {
              "partyIdType": "MSISDN",
              "partyIdentifier": "11194979",
              "fspId": "jcash"
            },
            "personalInfo": {
              "complexName": {
                "firstName": "Alex",
                "lastName": "Alligator",
                "middleName": "A",
              },
              "dateOfBirth": "1970-01-01",
            }
          }
        }

        // Act
        console.log('POST', uri)
        console.log('data', data)
        lookupResponse = (await axios.post(uri, data, config)).data

        // Assert
        expect(lookupResponse).toStrictEqual(expected)
      })
    })


    describe('gets an authorization request after I send a 3rd party transaction request', () => {
      it('', async () => {
        // Arrange
        expect(lookupResponse).toBeDefined()
        /*
        curl -X POST "http://sandbox.mojaloop.io/switch-ttk-backend/thirdpartyTransaction/b51ec534-ee48-4575-b6a9-ead2955b8069/initiate" -H  "accept: application/json"\
          -H  "Content-Type: application/json" \
          -d '{
            "payee":{
              "name":"Bob bobbington",
              "partyIdInfo":{
                "fspId":"dfspb",
                "partyIdType":"MSISDN",
                "partyIdentifier":"16135551212"
              }
            },
            "payer":{
              "partyIdType":"THIRD_PARTY_LINK",
              "partyIdentifier":"16135551212",
              "fspId":"dfspa"
            },
            "amountType":"RECEIVE",
            "amount":{
              "currency":"PHP",
              "amount":"123.47"
            },
            "transactionType":{
              "scenario":"TRANSFER",
              "initiator":"PAYER",
              "initiatorType":"CONSUMER"
            },
            "expiration":"2021-05-24T08:38:08.699-04:00"
          }'
        */
        const uri = `${paynowSyncAPI}/thirdpartyTransaction/${transactionRequestId}/initiate`
        const now = new Date()
        const expiryDate = new Date(now.setHours(now.getHours() + 1))
        const data = {
          transactionRequestId,
          payee: {
            name: lookupResponse.party.name,
            partyIdInfo: lookupResponse.party.partyIdInfo
          },
          payer: {
            partyIdType: 'THIRD_PARTY_LINK',
            partyIdentifier: thirdpartyLinkAccountId,
            fspId: 'bankone'
          },
          amountType: "RECEIVE",
          amount: {
            currency: 'PHP',
            amount: '123.47'
          },
          transactionType: {
            scenario: 'TRANSFER',
            initiator: 'PAYER',
            initiatorType: 'CONSUMER'
          },
          expiration: expiryDate.toISOString()
        }
        const expected = {
          currentState: 'authorizationReceived',
          authorization: {
            authorizationRequestId: expect.stringMatching('.*'),
            transactionRequestId: transactionRequestId,
            challenge: expect.stringMatching('.*'),
            transferAmount: {
              currency: 'PHP',
              amount: expect.stringMatching('.*')
            },
            payeeReceiveAmount: {
              currency: 'PHP',
              amount: expect.stringMatching('.*')
            },
            fees: {
              amount: expect.stringMatching('.*'),
              currency: "PHP"
            },
            payer: {
              partyIdType: 'THIRD_PARTY_LINK',
              partyIdentifier: thirdpartyLinkAccountId,
              fspId: 'bankone'
            },
            payee: {
              name: 'Alex Alligator',
              partyIdInfo: {
                fspId: 'jcash',
                partyIdType: 'MSISDN',
                partyIdentifier: '11194979',
              }
            },
            transactionType: {
              scenario: 'TRANSFER',
              initiator: 'PAYER',
              initiatorType: 'CONSUMER'
            },
            expiration: expect.stringMatching('.*')
          }
        }

        // Act
        console.log('POST', uri)
        console.log('data', data)
        authorizationResponse = (await axios.post(uri, data, config)).data

        // Assert
        expect(authorizationResponse).toStrictEqual(expected)
      })
    })

    describe('signs the authorization request with a FIDO private key', () => {
      it('', async () => {
        // Arrange
        expect(authorizationResponse).toBeDefined()
        /*
        curl -X POST "http://sandbox.mojaloop.io/switch-ttk-backend/thirdpartyTransaction/b51ec534-ee48-4575-b6a9-ead2955b8069/initiate" -H  "accept: application/json"\
          -H  "Content-Type: application/json" \
          -d '{
            "payee":{
              "name":"Bob bobbington",
              "partyIdInfo":{
                "fspId":"dfspb",
                "partyIdType":"MSISDN",
                "partyIdentifier":"16135551212"
              }
            },
            "payer":{
              "partyIdType":"THIRD_PARTY_LINK",
              "partyIdentifier":"16135551212",
              "fspId":"dfspa"
            },
            "amountType":"RECEIVE",
            "amount":{
              "currency":"PHP",
              "amount":"123.47"
            },
            "transactionType":{
              "scenario":"TRANSFER",
              "initiator":"PAYER",
              "initiatorType":"CONSUMER"
            },
            "expiration":"2021-05-24T08:38:08.699-04:00"
          }'
        */
        const uri = `${paynowSyncAPI}/thirdpartyTransaction/${transactionRequestId}/approve`
        const data = {
          authorizationResponse: {
            signedPayloadType: 'FIDO',
            signedPayload: {
              id: '45c-TkfkjQovQeAWmOy-RLBHEJ_e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA',
              rawId: '45c+TkfkjQovQeAWmOy+RLBHEJ/e4jYzQYgD8VdbkePgM5d98BaAadadNYrknxgH0jQEON8zBydLgh1EqoC9DA==',
              response: {
                authenticatorData: 'SZYN5YgOjGh0NBcPZHZgW4/krrmihjLHmVzzuoMdl2MBAAAACA==',
                clientDataJSON: 'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiQUFBQUFBQUFBQUFBQUFBQUFBRUNBdyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6NDIxODEiLCJjcm9zc09yaWdpbiI6ZmFsc2UsIm90aGVyX2tleXNfY2FuX2JlX2FkZGVkX2hlcmUiOiJkbyBub3QgY29tcGFyZSBjbGllbnREYXRhSlNPTiBhZ2FpbnN0IGEgdGVtcGxhdGUuIFNlZSBodHRwczovL2dvby5nbC95YWJQZXgifQ==',
                signature: 'MEUCIDcJRBu5aOLJVc/sPyECmYi23w8xF35n3RNhyUNVwQ2nAiEA+Lnd8dBn06OKkEgAq00BVbmH87ybQHfXlf1Y4RJqwQ8='
              },
              type: 'public-key'
            }
          }

        }
        const expected = {
          transactionStatus: {
            transactionId: expect.stringMatching('.*'),
            transactionRequestState: "ACCEPTED",
            transactionState: "COMPLETED"
          },
          currentState: "transactionStatusReceived"
        }

        // Act
        console.log('POST', uri)
        console.log('data', data)
        authorizationResponse = (await axios.post(uri, data, config)).data

        // Assert
        expect(authorizationResponse).toStrictEqual(expected)
      })
    })

  })

  describe('pisp <--> bankone unhappy path tansfer', () => {
    describe('fails to up a destination party that does not exist', () => {
      it('', async () => {
        // Arrange
        const uri = `${paynowSyncAPI}/thirdpartyTransaction/partyLookup`
        const data = {
          transactionRequestId: v4(),
          payee: {
            partyIdType: "MSISDN",
            partyIdentifier: "111222"
          }
        }
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        const expected = {
          "currentState": "partyLookupFailure",
          "errorInformation": {
            "errorCode": '3204',
            "errorDescription": "Party not found"
          }
        }

        // Act
        console.log('POST', uri)
        console.log('data', data)

        // Assert
        const lookupResponse = (await axios.post(uri, data, config)).data
        expect(lookupResponse).toStrictEqual(expected)
      })
    })
  })

  describe('paynow transfer', () => {
    it('allows me to lookup a user based on a social security id alias', async () => {
      // Arrange
      const uri = `${paynowSyncAPI}/thirdpartyTransaction/partyLookup`
      const data = {
        transactionRequestId: v4(),
        payee: {
          partyIdType: "ALIAS",
          partyIdentifier: "0034289"
        }
      }
      const expected = {
        "currentState": "partyLookupSuccess",
        "party": {
          "name": "Alex Alligator",
          "partyIdInfo": {
            "partyIdType": "ALIAS",
            "partyIdentifier": "0034289",
            "fspId": "jcash"
          },
          "personalInfo": {
            "complexName": {
              "firstName": "Alex",
              "lastName": "Alligator",
              "middleName": "A",
            },
            "dateOfBirth": "1970-01-01",
          }
        }
      }

      // Act
      console.log('POST', uri)
      console.log('data', data)
      const response = (await axios.post(uri, data, config)).data

      // Assert
      expect(response).toStrictEqual(expected)
    })

    it.todo('if I send an invalid signed challenge, I get an error from the DFSP')
  })
})