
import axios, { AxiosRequestConfig } from 'axios'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

/// Note: run these tests with `--runInBand` as there is shared state between tests that needs to be populated
describe('pisp sync API', () => {
  describe('pispa linking', () => {
    const userId = `61414414414`
    let accounts: Array<unknown>;

    it('gets a list of available providers', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/providers`
      console.log('GET', uri)
      const expected = {
        currentState: "providersLookupSuccess",
        providers: [
          "bankone",
        ],
      }

      // Act
      const response = (await axios.get(uri, {})).data
      
      
      // Assert
      expect(response).toStrictEqual(expected)
    })

    it('gets a list of accounts for linking from bankone', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/accounts/bankone/${userId}`
      console.log('GET', uri)
      const expected = {
        accounts: [
          {
            accountNickname: "Everyday Spend",
            currency: expect.stringMatching('.*'),
            id: expect.stringMatching('.*'),
          }
        ],
        currentState: 'COMPLETED'
      }

      // Act
      const response = (await axios.get(uri, {})).data

      // Save the accounts list for later:
      accounts = response.accounts


      // Assert
      expect(response).toStrictEqual(expected)
    })

    // TODO: come back to this - waiting on a fix for the BankOne Simulator
    it.skip('returns an appropriate error when the accounts cannot be found', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/accounts/bankone/blablabla`
      console.log('GET', uri)
      // const expected = {}

      // Act 
      try {
        await axios.get(uri, {})
        throw new Error('Should not be executed!')
      } catch(err) {
        console.log(err.response)


        // Assert
        expect(err.response.status).toBe(404)
      }
    })

    it.only('sends an OTP to my phone number when I start the consentRequest process', async () => {
      // Arrange

      //temp debugging:
      accounts = [
        {
          accountNickname: 'Everyday Spend',
          id: '14d945b7-a90a-4095-88b8-2c80bf0d1df4',
          currency: 'TZS'
        }
      ]

      expect(accounts).toBeDefined()
      expect(userId).toBeDefined()

      /*
      curl -X POST "http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent" \
        -H  "accept: application/json" \
        -H  "Content-Type: application/json" -d "{\"consentRequestId\":\"f6ab43b0-71cc-49f9-b763-2ac3f05ac8c1\",\"toParticipantId\":\"dfspa\",\"accounts\":[{\"accountNickname\":\"SpeXXXXXXXXnt\",\"id\":\"dfspa.username.5678\",\"currency\":\"USD\"}],\"actions\":[\"accounts.transfer\"],\"userId\":\"username1234\",\"callbackUri\":\"pisp-app://callback\"}"

      */
      const uri = `${pispaSyncAPI}/linking/request-consent`
      const data = {
        consentRequestId: 'f6ab43b0-71cc-49f9-b763-2ac3f05ac8c1',
        toParticipantId: 'bankone',
        accounts,
        actions:[
          'accounts.transfer'
        ],
        userId,
        callbackUri: "pisp-app://callback"
      }
        // callbackUri\":\"pisp-app://callback\"}"
      const config: AxiosRequestConfig = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
      console.log('POST', uri)
      console.log('data', data)
      const expected = {
        accounts: [
          {
            accountNickname: "Everyday Spend",
            currency: expect.stringMatching('.*'),
            id: expect.stringMatching('.*'),
          }
        ],
        currentState: 'COMPLETED'
      }

      // Act
      const response = (await axios.post(uri, data, config)).data


      // Assert
      expect(response).toStrictEqual(expected)
    })



    it.todo('returns an error if I try to link an unknown account')
    it.todo('returns an error if I try to link an account with a dfsp that is not bankone')
    it.todo('returns a Consent object when I send the correct OTP')
    it.todo('returns an error when I send an incorrect OTP')
    it.todo('returns success when I submit a valid credential and signature')
    it.todo('returns an error if I send a bad credential or invalid signature')
    it.todo('allows me to lookup the consent object with the central auth-service')
  })

  describe('pispa transfer', () => {
    it.todo('allows me to lookup a user based on a social security id alias')
    it.todo('returns an error when I lookup a party that does not exist')
    it.todo('when I enter in a transfer amount, it  returns an authoriztion request with details about the transfer fees')
    it.todo('when I sign the transfer with the example payload, I get confirmation that the transfer was processed')
    it.todo('if I send an invalid signed challenge, I get an error from the DFSP')
  })
})