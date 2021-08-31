import axios, { AxiosRequestConfig } from 'axios'
import { v4 } from 'uuid'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

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
    // const userId = `61414414414`

    // Hardcode a consentId + thirdparty account link
    // ideally, we would implement a GET somewhere so we dont
    // need to hardcode
    const thirdpartyLinkAccountId = '369f8bcf6870743d528026fb65439af'
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
        const uri = `${pispaSyncAPI}/thirdpartyTransaction/partyLookup`
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
              "fspId": "applebank"
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
              "currency":"USD",
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
        const uri = `${pispaSyncAPI}/thirdpartyTransaction/${transactionRequestId}/initiate`
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
          amount:{
            currency: 'USD',
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
              currency: 'USD', 
              amount: expect.stringMatching('.*') 
            },
            payeeReceiveAmount: { 
              currency: 'USD',
              amount: expect.stringMatching('.*') 
            },
            fees: {
              amount: expect.stringMatching('.*'),
              currency: "USD"
            },
            payer: {
              partyIdType: 'THIRD_PARTY_LINK',
              partyIdentifier: thirdpartyLinkAccountId,
              fspId: 'bankone'
            },
            payee: { 
              name: 'Alex Alligator', 
              partyIdInfo: {
                fspId: 'applebank',
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
              "currency":"USD",
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
        const uri = `${pispaSyncAPI}/thirdpartyTransaction/${transactionRequestId}/initiate`
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
          amount:{
            currency: 'USD',
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
              currency: 'USD', 
              amount: expect.stringMatching('.*') 
            },
            payeeReceiveAmount: { 
              currency: 'USD',
              amount: expect.stringMatching('.*') 
            },
            fees: {
              amount: expect.stringMatching('.*'),
              currency: "USD"
            },
            payer: {
              partyIdType: 'THIRD_PARTY_LINK',
              partyIdentifier: thirdpartyLinkAccountId,
              fspId: 'bankone'
            },
            payee: { 
              name: 'Alex Alligator', 
              partyIdInfo: {
                fspId: 'applebank',
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

  })

  describe('pisp <--> bankone unhappy path tansfer', () => {
    describe('fails to up a destination party that does not exist', () => {
      it('', async () => {
        // Arrange
        const uri = `${pispaSyncAPI}/thirdpartyTransaction/partyLookup`
        const data = {
          transactionRequestId: v4(),
          payee: {
            partyIdType: "MSISDN",
            partyIdentifier: "123456789"
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
            "errorCode": '3201',
            "errorDescription": "Destination FSP Error"
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

  describe('pispa transfer', () => {
    it.only('allows me to lookup a user based on a social security id alias', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/thirdpartyTransaction/partyLookup`
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
            "fspId": "applebank"
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

    it.todo('returns an error when I lookup a party that does not exist')
    it.todo('when I enter in a transfer amount, it  returns an authoriztion request with details about the transfer fees')
    it.todo('when I sign the transfer with the example payload, I get confirmation that the transfer was processed')
    it.todo('if I send an invalid signed challenge, I get an error from the DFSP')
  })
})