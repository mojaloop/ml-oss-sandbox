
import axios from 'axios'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

describe('pisp sync API', () => {
  describe('pispa', () => {
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

    it.only('gets a list of accounts for linking from bankone', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/accounts/bankone/61414414414`
      console.log('GET', uri)
      const expected = {}

      // Act
      const response = await axios.get(uri, {})


      // Assert
      expect(response).toStrictEqual(expected)
    })

    it.skip('returns an appropriate error when the accounts cannot be found', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/accounts/bankone/username1234`
      console.log('GET', uri)
      const expected = {}

      // Act
      const response = await axios.get(uri, {})


      // Assert
      expect(response).toStrictEqual(expected)
    })
  })
})