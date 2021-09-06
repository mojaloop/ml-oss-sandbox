import axios, { AxiosRequestConfig } from 'axios'

const config: AxiosRequestConfig = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
}

const baseUrl = 'sandbox.mojaloop.io'


describe.skip('simulator sync tests', () => {

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

  it('sends a transfer from jcash to skybank', async () => {
    // Arrange
    const uri = `http://jcash-sdk-scheme-adapter-outbound.sandbox.mojaloop.io/tranfers`
    const data = {
      "homeTransactionId": "string",
      "from": {
        "type": "CONSUMER",
        "idType": "PERSONAL_ID",
        "idValue": "16135551212",
        "idSubValue": "string",
        "displayName": "string",
        "firstName": "Henrik",
        "middleName": "Johannes",
        "lastName": "Karlsson",
        "dateOfBirth": "1966-06-16",
        "fspId": "string",
      },
      "to": {
        "type": "CONSUMER",
        "idType": "PERSONAL_ID",
        "idValue": "16135551212",
        "idSubValue": "string",
        "displayName": "string",
        "firstName": "Henrik",
        "middleName": "Johannes",
        "lastName": "Karlsson",
        "dateOfBirth": "1966-06-16",
        "fspId": "string",
      },
      "amountType": "RECEIVE",
      "currency": "PHP",
      "amount": "1002",
      "transactionType": "TRANSFER",
      "note": "Note sent to Payee.",
    }

    // Act
    const response = (await axios.post(uri, data, config)).data


    // Assert
    console.log(response)
  })

})