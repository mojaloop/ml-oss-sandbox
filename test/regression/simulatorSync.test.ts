import axios, { AxiosRequestConfig } from 'axios'
import { v4 } from 'uuid'

// const paynowSyncAPI = `http://paynow-thirdparty-scheme-adapter-outbound.${baseUrl}`

jest.setTimeout(10 * 1000)


const config: AxiosRequestConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}
const baseUrl = 'sandbox.mojaloop.io'


describe('simulator sync tests', () => {
  describe('jcash', () => {
    it('looks up a user based on a BUSINESS id', async () => {
      // Arrange
      const uri = `http://jcash-backend.${baseUrl}/repository/parties/BUSINESS/001239`

      // Act
      const expected = {
        "displayName": "Mr. Pandesal",
        "firstName": "M",
        "middleName": "A",
        "lastName": "Pandesal",
        "dateOfBirth": "1970-01-01",
        "idType": "BUSINESS",
        "idValue": "001239"
      }
      const lookupResponse = (await axios.get(uri, config)).data

      // Assert
      expect(lookupResponse).toStrictEqual(expected)
    })

    it('sends a transfer from jcash to skybank in 3 steps', async () => {
      // Arrange
      const uriTransfers = `http://jcash-sdk-scheme-adapter-outbound.${baseUrl}/transfers`
      const homeTransactionId = v4()
      const requestInit = {
        homeTransactionId,
        "from": {
          "idType": "MSISDN",
          "idValue": "949309489"
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
      }
      const expectedInitResponse = expect.objectContaining({
        homeTransactionId,
        from: { idType: 'MSISDN', idValue: '949309489' },
        to: {
          idType: 'MSISDN',
          idValue: '329294234',
          fspId: 'skybank',
          firstName: 'Daniel',
          middleName: 'B',
          lastName: 'Rizal',
          dateOfBirth: '1970-01-01'
        },
        amountType: 'RECEIVE',
        currency: 'PHP',
        amount: '1000',
        transactionType: 'TRANSFER',
        note: 'Note sent to Payee.',
        transferId: expect.stringMatching('.*'),
        currentState: 'WAITING_FOR_PARTY_ACCEPTANCE',
        initiatedTimestamp: expect.stringMatching('.*')
      })
    
      // Act
      const responseInit = (await axios.post(uriTransfers, requestInit, config)).data

      // Assert
      expect(responseInit).toEqual(expectedInitResponse)

      const transferId = responseInit.transferId
      console.log('transferId:', transferId)

      // Arrange
      const uriTransfersId = `http://jcash-sdk-scheme-adapter-outbound.${baseUrl}/transfers/${transferId}`
      const requestAcceptParty = {
        acceptParty: true
      }
      const expectedResponseAcceptParty = expect.objectContaining({
        currentState: 'WAITING_FOR_QUOTE_ACCEPTANCE'
      })
      
      // Act
      const responseAcceptParty = (await axios.put(uriTransfersId, requestAcceptParty, config)).data
      
      // Assert
      expect(responseAcceptParty).toEqual(expectedResponseAcceptParty)

      // Arrange
      const requestAcceptQuote = {
        acceptQuote: true
      }
      const expectedResponseAcceptQuote = expect.objectContaining({
        homeTransactionId,
        quoteResponseSource: 'skybank',
        fulfil: {
          completedTimestamp: expect.stringMatching('.*'),
          transferState: 'COMMITTED',
          fulfilment: expect.stringMatching('.*')
        }
      })

      // Act
      const responseAcceptQuote = (await axios.put(uriTransfersId, requestAcceptQuote, config)).data

      // Assert
      expect(responseAcceptQuote).toEqual(expectedResponseAcceptQuote)
    })
  })

  describe('anz', () => {
    it('sends a transfer in 1 API call', async () => {
      // Arrange
      const homeTransactionId = v4()
      const request = {
        homeTransactionId,
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
      }
      const uri = `http://anz-sdk-scheme-adapter-outbound.${baseUrl}/transfers`
      const expected = expect.objectContaining({
        homeTransactionId,
        quoteResponseSource: 'skybank',
        fulfil: {
          completedTimestamp: expect.stringMatching('.*'),
          transferState: 'COMMITTED',
          fulfilment: expect.stringMatching('.*')
        }
      })
      
      // Act
      const response = (await axios.post(uri, request, config)).data
    
      // Assert
      expect(response).toEqual(expected)
    })
  })
})