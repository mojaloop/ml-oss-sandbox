
import axios from 'axios'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

describe('pisp sync API', () => {
  describe('pispa', () => {
    it.only('gets a list of available providers', async () => {
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
  })
})