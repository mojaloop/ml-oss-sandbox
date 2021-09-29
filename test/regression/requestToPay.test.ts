import axios, { AxiosRequestConfig } from 'axios'
import { v4 } from 'uuid'

jest.setTimeout(10 * 1000)

const config: AxiosRequestConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}
const baseUrl = 'sandbox.mojaloop.io'


describe('request to pay', () => {


  it('issues a requestToPay', async () => {
    // Arrange
    const uriRtp = `http://jcash-sdk-scheme-adapter-outbound.${baseUrl}/requestToPayTransfer`
    const requestToPayTransactionId = v4()
    const requestToPayInit = {
      requestToPayTransactionId,
      "from": {
        "idType": "MSISDN",
        "idValue": "329294234",
        fspId: 'skybank',
      },
      "to": {
        "idType": "MSISDN",
        "idValue": "949309489",
        fspId: 'jcash'
      },
      "amountType": "RECEIVE",
      "currency": "PHP",
      "amount": "1000",
      "initiator": "PAYEE",
      "initiatorType": "CONSUMER",
      "scenario": {
        "scenario": "DEPOSIT",
        "subScenario": "LOCALLY_DEFINED_SUBSCENARIO",
        "initiator": "PAYEE",
        "initiatorType": "CONSUMER"
      },
    }
    const expectedInitResponse = expect.objectContaining({
      requestToPayTransactionId,
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
    const initRtpResponse = (await axios.post(uriRtp, requestToPayInit, config)).data
     
    // Assert
    console.log(initRtpResponse)
    expect(initRtpResponse).toEqual(expectedInitResponse)
    
    const transactionRequestId = initRtpResponse.transactionRequestId
    console.log('transactionRequestId:', transactionRequestId)


    // Arrange
    // const uriAcceptParty = `http://jcash-sdk-scheme-adapter-outbound.${baseUrl}/requestToPayTransfer/${transactionRequestId}`
    // const bodyAcceptParty = {

    // }

    // // Act
    // const acceptPartyResponse = (await axios.post(uriRtp, requestToPayInit, config)).data
     
     // Assert
   })
})