
import axios from 'axios'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

describe('pisp sync API', () => {
  describe('pispa linking', () => {
    it('gets a list of available providers', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/providers`
      console.log('GET', uri)
      const expected = {}

      // Act
      const response = await axios.get(uri, {})
      
      
      // Assert
      expect(response).toStrictEqual(expected)
    })

    it('gets a list of accounts for linking from bankone', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/accounts/bankone/61414414414`
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


      // Assert
      expect(response).toStrictEqual(expected)
    })

    // TODO: come back to this - waiting on a fix for the BankOne Simulator
    it.only('returns an appropriate error when the accounts cannot be found', async () => {
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

    it.todo('sends an OTP to my phone number when I start the consentRequest process')
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