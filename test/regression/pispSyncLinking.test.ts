
import axios, { AxiosRequestConfig } from 'axios'
import { v4 } from 'uuid'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

describe('pisp sync API', () => {

  // Shared state for these flow.
  // Each has it's own describe block to ensure tests run in order
  describe.only('pisp <---> bankone happy path linking', () => {
    const userId = `61414414414`
    const consentRequestId = v4()
    let accounts: Array<unknown>;
    let consentId: string;

    describe('gets a list of available providers', () => {
      it('', async () => {
        // Arrange
        const uri = `${pispaSyncAPI}/linking/providers`
        console.log('GET', uri)
        const expected = {
          currentState: 'providersLookupSuccess',
          providers: [
            'bankone',
          ],
        }

        // Act
        const response = (await axios.get(uri, {})).data


        // Assert
        expect(response).toStrictEqual(expected)
      })
    })

    describe('gets a list of accounts for linking from bankone', () => {
      it('', async () => {
        // Arrange
        const uri = `${pispaSyncAPI}/linking/accounts/bankone/${userId}`
        console.log('GET', uri)
        const expected = {
          accounts: [
            {
              accountNickname: 'Everyday Spend',
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
    })

    describe('sends an OTP to my phone number when I start the consentRequest process', () => {
      it('', async () => {

        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()

        /*
        curl -X POST 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent' \
          -H  'accept: application/json' \
          -H  'Content-Type: application/json' -d '{\'consentRequestId\':\'f6ab43b0-71cc-49f9-b763-2ac3f05ac8c1\',\'toParticipantId\':\'dfspa\',\'accounts\':[{\'accountNickname\':\'SpeXXXXXXXXnt\',\'id\':\'dfspa.username.5678\',\'currency\':\'USD\'}],\'actions\':[\'accounts.transfer\'],\'userId\':\'username1234\',\'callbackUri\':\'pisp-app://callback\'}'
  
        */
        const uri = `${pispaSyncAPI}/linking/request-consent`
        const data = {
          consentRequestId,
          toParticipantId: 'bankone',
          accounts,
          actions: [
            'accounts.transfer'
          ],
          userId,
          callbackUri: 'pisp-app://callback'
        }
        // callbackUri\':\'pisp-app://callback\'}'
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('POST', uri)
        console.log('data', data)
        const expected = {
          channelResponse: {
            authChannels: ['OTP'],
            callbackUri: 'pisp-app://callback',
            consentRequestId,
            scopes: [
              {
                // @ts-ignore
                accountId: accounts[0].id,
                actions: ['accounts.transfer']
              }
            ],
          },
          currentState: 'OTPAuthenticationChannelResponseRecieved'
        }

        // Act
        const response = (await axios.post(uri, data, config)).data


        // Assert
        expect(response).toStrictEqual(expected)
      })
    })

    describe('returns a Consent object when I send the correct OTP', () => {
      it('', async () => {

        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()

        /*
          curl -X PATCH 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent/b51ec534-ee48-4575-b6a9-ead2955b8069/authenticate' \
               -H  'accept: application/json' \
               -H  'Content-Type: application/json' \
               -d '{\'authToken\':\'111222\'}'
        */
        const uri = `${pispaSyncAPI}/linking/request-consent/${consentRequestId}/authenticate`
        const data = {
          // token 111222 is a special token that will alway succeed
          authToken: '111222'
        }
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('PATCH', uri)
        console.log('data', data)
        const expected = {
          challenge: expect.stringMatching('.*'),
          consent: {
            consentId: expect.stringMatching('.*'),
            consentRequestId,
            scopes: [
              {
                // @ts-ignore
                'accountId': accounts[0].id,
                'actions': [
                  'accounts.transfer',
                ],
              },
            ],
          },
          currentState: 'consentReceivedAwaitingCredential'
        }

        // Act
        const response = (await axios.patch(uri, data, config)).data

        // Assert
        expect(response).toStrictEqual(expected)

        // store for the next test
        consentId = response.consent.consentId;
      })
    })

    describe('updates the consent object with a valid credential', () => {
      it('', async () => {
        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()
        expect(consentId).toBeDefined()

        /*
          curl -X POST "http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent/b51ec534-ee48-4575-b6a9-ead2955b8069/pass-credential" \
               -H  "accept: application/json" \
               -H  "Content-Type: application/json" 
               -d "{
                "credential":{
                  "credentialType":"FIDO",
                  "status":"PENDING",
                  "payload":{
                    "id":"HskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAtw",
                    "rawId":"HskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAtw==",
                    "response":{
                      "clientDataJSON":"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWXpSaFpHRmlZak16WlRrek1EWmlNRE00TURnNE1UTXlZV1ptWTJSbE5UVTJZelV3WkRneVpqWXdNMlkwTnpjeE1XRTVOVEV3WW1ZelltVmxaalprTmciLCJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjQyMTgxIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ==",
                      "attestationObject":"o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEcwRQIhAN2JDPPTse/45EHSqSpEJiiok5sns+HqdJch3+gsL09VAiAh7W7ZhQC8gMIkgwcA+S4rQkaHoHnP9AkkohaKCuuA62N4NWOBWQLBMIICvTCCAaWgAwIBAgIECwXNUzANBgkqhkiG9w0BAQsFADAuMSwwKgYDVQQDEyNZdWJpY28gVTJGIFJvb3QgQ0EgU2VyaWFsIDQ1NzIwMDYzMTAgFw0xNDA4MDEwMDAwMDBaGA8yMDUwMDkwNDAwMDAwMFowbjELMAkGA1UEBhMCU0UxEjAQBgNVBAoMCVl1YmljbyBBQjEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEnMCUGA1UEAwweWXViaWNvIFUyRiBFRSBTZXJpYWwgMTg0OTI5NjE5MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEIRpvsbWJJcsKwRhffCrjqLSIEBR5sR7/9VXgfZdRvSsXaiUt7lns44WZIFuz6ii/j9f8fadcBUJyrkhY5ZH8WqNsMGowIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjEwEwYLKwYBBAGC5RwCAQEEBAMCBDAwIQYLKwYBBAGC5RwBAQQEEgQQFJogIY72QTOWuIH41bfx9TAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQA+/qPfPSrgclePfgTQ3VpLaNsBr+hjLhi04LhzQxiRGWwYS+vB1TOiPXeLsQQIwbmqQU51doVbCTaXGLNIr1zvbLAwhnLWH7i9m4ahCqaCzowtTvCQ7VBUGP5T1M4eYnoo83IDCVjQj/pZG8QYgOGOigztGoWAf5CWcUF6C0UyFbONwUcqJEl2QLToa/7E8VRjm4W46IAUljYkODVZASv8h3wLROx9p5TSBlSymtwdulxQe/DKbfNSvM3edA0up+EIJKLOOU+QTR2ZQV46fEW1/ih6m8vcaY6L3NW0eYpc7TXeijUJAgoUtya/vzmnRAecuY9bncoJt8PrvL2ir2kDaGF1dGhEYXRhWMRJlg3liA6MaHQ0Fw9kdmBbj+SuuaKGMseZXPO6gx2XY0EAAAAEFJogIY72QTOWuIH41bfx9QBAHskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAt6UBAgMmIAEhWCBYz+SV6fSy7ZjFzdj+SWxaMbfaw4ZT+wYgClN3v93kVSJYIGSzY41DNLrh1jXp4J53qCnq4+b9HYXud/0UEsZquDeV"
                    },
                    "type":"public-key"
                  }
                }
              }"
         */
        const uri = `${pispaSyncAPI}/linking/request-consent/${consentRequestId}/pass-credential`
        const data = {
          credential: {
            credentialType: 'FIDO',
            status: 'PENDING',
            payload: {
              // this id is configured to skip auth-service validation for testing
              id: 'Jfo5k6w4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAtw==',
              rawId: "Jfo5k6w4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAtw==",
              response: {
                clientDataJSON: "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWXpSaFpHRmlZak16WlRrek1EWmlNRE00TURnNE1UTXlZV1ptWTJSbE5UVTJZelV3WkRneVpqWXdNMlkwTnpjeE1XRTVOVEV3WW1ZelltVmxaalprTmciLCJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjQyMTgxIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ==",
                attestationObject: "o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEcwRQIhAN2JDPPTse/45EHSqSpEJiiok5sns+HqdJch3+gsL09VAiAh7W7ZhQC8gMIkgwcA+S4rQkaHoHnP9AkkohaKCuuA62N4NWOBWQLBMIICvTCCAaWgAwIBAgIECwXNUzANBgkqhkiG9w0BAQsFADAuMSwwKgYDVQQDEyNZdWJpY28gVTJGIFJvb3QgQ0EgU2VyaWFsIDQ1NzIwMDYzMTAgFw0xNDA4MDEwMDAwMDBaGA8yMDUwMDkwNDAwMDAwMFowbjELMAkGA1UEBhMCU0UxEjAQBgNVBAoMCVl1YmljbyBBQjEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEnMCUGA1UEAwweWXViaWNvIFUyRiBFRSBTZXJpYWwgMTg0OTI5NjE5MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEIRpvsbWJJcsKwRhffCrjqLSIEBR5sR7/9VXgfZdRvSsXaiUt7lns44WZIFuz6ii/j9f8fadcBUJyrkhY5ZH8WqNsMGowIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjEwEwYLKwYBBAGC5RwCAQEEBAMCBDAwIQYLKwYBBAGC5RwBAQQEEgQQFJogIY72QTOWuIH41bfx9TAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQA+/qPfPSrgclePfgTQ3VpLaNsBr+hjLhi04LhzQxiRGWwYS+vB1TOiPXeLsQQIwbmqQU51doVbCTaXGLNIr1zvbLAwhnLWH7i9m4ahCqaCzowtTvCQ7VBUGP5T1M4eYnoo83IDCVjQj/pZG8QYgOGOigztGoWAf5CWcUF6C0UyFbONwUcqJEl2QLToa/7E8VRjm4W46IAUljYkODVZASv8h3wLROx9p5TSBlSymtwdulxQe/DKbfNSvM3edA0up+EIJKLOOU+QTR2ZQV46fEW1/ih6m8vcaY6L3NW0eYpc7TXeijUJAgoUtya/vzmnRAecuY9bncoJt8PrvL2ir2kDaGF1dGhEYXRhWMRJlg3liA6MaHQ0Fw9kdmBbj+SuuaKGMseZXPO6gx2XY0EAAAAEFJogIY72QTOWuIH41bfx9QBAHskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAt6UBAgMmIAEhWCBYz+SV6fSy7ZjFzdj+SWxaMbfaw4ZT+wYgClN3v93kVSJYIGSzY41DNLrh1jXp4J53qCnq4+b9HYXud/0UEsZquDeV"
              },
              type: "public-key"
            }
          }
        }
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('POST', uri)
        console.log('data', data)
        const expected = {
          credential: {
            status: "VERIFIED"
          },
          currentState: "accountsLinked"
        }

        // Act
        const response = (await axios.post(uri, data, config)).data

        // Assert
        expect(response).toStrictEqual(expected)
      })
    })

    describe('allows me to lookup the consent object with the central auth-service', () => {
      it.todo('...')
    })
  })

  describe('pisp <---> bankone unhappy path linking - no accounts found', () => {
    it('returns an appropriate error when the accounts cannot be found', async () => {
      // Arrange
      const uri = `${pispaSyncAPI}/linking/accounts/bankone/blablabla`
      console.log('GET', uri)

      // Act 
      try {
        await axios.get(uri, {})
        throw new Error('Should not be executed!')
      } catch(err) {
        // Assert
        expect(err.response.status).toBe(404)
      }
    })
  });

  describe('pisp <---> bankone unhappy path linking - account selection errors', () => { 
    it('returns an error if I try to link an unknown account', async () => {
      // Arrange
      const userId = `61414414414`
      const consentRequestId = v4()
      const accounts = [{
        accountNickname: 'Everyday Spend',
        currency: 'USD',
        id: 'some-random-string-bankone-wont-like'
      }]

      const uri = `${pispaSyncAPI}/linking/request-consent`
      const data = {
        consentRequestId,
        toParticipantId: 'bankone',
        accounts,
        actions: [
          'accounts.transfer'
        ],
        userId,
        callbackUri: 'pisp-app://callback'
      }
      // callbackUri\':\'pisp-app://callback\'}'
      const config: AxiosRequestConfig = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
      console.log('POST', uri)
      console.log('data', data)
      const expected = {
        currentState: 'errored',
        // TODO: change this to a better data!
        errorInformation: {
          errorCode: "7200",
          errorDescription: "Generic Thirdparty account linking error",
        },
      }

      // Act
      try {
        await axios.post(uri, data, config)
        throw new Error('Should not be executed')
      } catch(err) {
        // Assert
        expect(err.response.data).toStrictEqual(expected)
        // TODO: change this to a status code of 400
        expect(err.response.status).toStrictEqual(500)
      }
    })

    /// Note: for now the 3p-scheme-adapter only handles this through a timeout
    it('returns an error if I try to link an account with a dfsp that is not bankone', async () => {
      // Arrange
      jest.setTimeout(45 * 1000)

      const userId = `61414414414`
      const consentRequestId = v4()
      const accounts = [{
        accountNickname: 'Everyday Spend',
        currency: 'USD',
        id: 'some-random-string-bankone-wont-like'
      }]

      const uri = `${pispaSyncAPI}/linking/request-consent`
      const data = {
        consentRequestId,
        toParticipantId: 'notbankone',
        accounts,
        actions: [
          'accounts.transfer'
        ],
        userId,
        callbackUri: 'pisp-app://callback'
      }
      // callbackUri\':\'pisp-app://callback\'}'
      const config: AxiosRequestConfig = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
      console.log('POST', uri)
      console.log('data', data)
      const expected = {
        errorInformation: {
          errorCode: "2001",
          errorDescription: "Internal server error - Timeout",
        },
      }

      // Act
      try {
        await axios.post(uri, data, config)
        throw new Error('Should not be executed')
      } catch(err) {
        // Assert
        expect(err.response.data).toStrictEqual(expected)
        expect(err.response.status).toStrictEqual(500)
      }
    })
  })

  describe('pisp <---> bankone unhappy path linking - invalid OTP', () => { 
    const userId = `61414414414`
    const consentRequestId = v4()
    let accounts: Array<unknown>;

    describe('gets a list of accounts for linking from bankone', () => {
      it('', async () => {
        // Arrange
        const uri = `${pispaSyncAPI}/linking/accounts/bankone/${userId}`
        console.log('GET', uri)
        const expected = {
          accounts: [
            {
              accountNickname: 'Everyday Spend',
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
    })

    describe('sends an OTP to my phone number when I start the consentRequest process', () => {
      it('', async () => {

        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()

        /*
        curl -X POST 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent' \
          -H  'accept: application/json' \
          -H  'Content-Type: application/json' -d '{\'consentRequestId\':\'f6ab43b0-71cc-49f9-b763-2ac3f05ac8c1\',\'toParticipantId\':\'dfspa\',\'accounts\':[{\'accountNickname\':\'SpeXXXXXXXXnt\',\'id\':\'dfspa.username.5678\',\'currency\':\'USD\'}],\'actions\':[\'accounts.transfer\'],\'userId\':\'username1234\',\'callbackUri\':\'pisp-app://callback\'}'
  
        */
        const uri = `${pispaSyncAPI}/linking/request-consent`
        const data = {
          consentRequestId,
          toParticipantId: 'bankone',
          accounts,
          actions: [
            'accounts.transfer'
          ],
          userId,
          callbackUri: 'pisp-app://callback'
        }
        // callbackUri\':\'pisp-app://callback\'}'
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('POST', uri)
        console.log('data', data)
        const expected = {
          channelResponse: {
            authChannels: ['OTP'],
            callbackUri: 'pisp-app://callback',
            consentRequestId,
            scopes: [
              {
                // @ts-ignore
                accountId: accounts[0].id,
                actions: ['accounts.transfer']
              }
            ],
          },
          currentState: 'OTPAuthenticationChannelResponseRecieved'
        }

        // Act
        const response = (await axios.post(uri, data, config)).data


        // Assert
        expect(response).toStrictEqual(expected)
      })
    })

    // TODO: fix this - it appears to be a problem between the BankOne 3p-scheme-adapter and backend
    describe.skip('returns an error when I send an incorrect OTP', () => {
      it('', async () => {

        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()

        const uri = `${pispaSyncAPI}/linking/request-consent/${consentRequestId}/authenticate`
        const data = {
          // This will not be correct
          authToken: '000000'
        }
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('PATCH', uri)
        console.log('data', data)
        const expected = {
          challenge: expect.stringMatching('.*'),
          consent: {
            consentId: expect.stringMatching('.*'),
            consentRequestId,
            scopes: [
              {
                // @ts-ignore
                'accountId': accounts[0].id,
                'actions': [
                  'accounts.transfer',
                ],
              },
            ],
          },
          currentState: 'consentReceivedAwaitingCredential'
        }

        // Act
        try {
          await axios.patch(uri, data, config)
          throw new Error('Should not be executed')
        } catch (err) {
          // Assert
          expect(err.response.data).toStrictEqual(expected)
          expect(err.response.status).toStrictEqual(401)
        }
      })
    })
  })

  describe('pisp <---> bankone unhappy path linking - bad credential', () => { 
    const userId = `61414414414`
    const consentRequestId = v4()
    let accounts: Array<unknown>;
    let consentId: string;

    describe('gets a list of accounts for linking from bankone', () => {
      it('', async () => {
        // Arrange
        const uri = `${pispaSyncAPI}/linking/accounts/bankone/${userId}`
        console.log('GET', uri)
        const expected = {
          accounts: [
            {
              accountNickname: 'Everyday Spend',
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
    })

    describe('sends an OTP to my phone number when I start the consentRequest process', () => {
      it('', async () => {

        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()

        /*
        curl -X POST 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent' \
          -H  'accept: application/json' \
          -H  'Content-Type: application/json' -d '{\'consentRequestId\':\'f6ab43b0-71cc-49f9-b763-2ac3f05ac8c1\',\'toParticipantId\':\'dfspa\',\'accounts\':[{\'accountNickname\':\'SpeXXXXXXXXnt\',\'id\':\'dfspa.username.5678\',\'currency\':\'USD\'}],\'actions\':[\'accounts.transfer\'],\'userId\':\'username1234\',\'callbackUri\':\'pisp-app://callback\'}'
  
        */
        const uri = `${pispaSyncAPI}/linking/request-consent`
        const data = {
          consentRequestId,
          toParticipantId: 'bankone',
          accounts,
          actions: [
            'accounts.transfer'
          ],
          userId,
          callbackUri: 'pisp-app://callback'
        }
        // callbackUri\':\'pisp-app://callback\'}'
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('POST', uri)
        console.log('data', data)
        const expected = {
          channelResponse: {
            authChannels: ['OTP'],
            callbackUri: 'pisp-app://callback',
            consentRequestId,
            scopes: [
              {
                // @ts-ignore
                accountId: accounts[0].id,
                actions: ['accounts.transfer']
              }
            ],
          },
          currentState: 'OTPAuthenticationChannelResponseRecieved'
        }

        // Act
        const response = (await axios.post(uri, data, config)).data


        // Assert
        expect(response).toStrictEqual(expected)
      })
    })
    
    describe('returns a Consent object when I send the correct OTP', () => {
      it('', async () => {

        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()

        /*
          curl -X PATCH 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent/b51ec534-ee48-4575-b6a9-ead2955b8069/authenticate' \
               -H  'accept: application/json' \
               -H  'Content-Type: application/json' \
               -d '{\'authToken\':\'111222\'}'
        */
        const uri = `${pispaSyncAPI}/linking/request-consent/${consentRequestId}/authenticate`
        const data = {
          // token 111222 is a special token that will alway succeed
          authToken: '111222'
        }
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('PATCH', uri)
        console.log('data', data)
        const expected = {
          challenge: expect.stringMatching('.*'),
          consent: {
            consentId: expect.stringMatching('.*'),
            consentRequestId,
            scopes: [
              {
                // @ts-ignore
                'accountId': accounts[0].id,
                'actions': [
                  'accounts.transfer',
                ],
              },
            ],
          },
          currentState: 'consentReceivedAwaitingCredential'
        }

        // Act
        const response = (await axios.patch(uri, data, config)).data

        // Assert
        expect(response).toStrictEqual(expected)

        // store for the next test
        consentId = response.consent.consentId;
      })
    })


    describe('returns an error when I send an invalid credential', () => {
      it('', async () => {
        // Arrange
        expect(accounts).toBeDefined()
        expect(userId).toBeDefined()
        expect(consentRequestId).toBeDefined()
        expect(consentId).toBeDefined()

        const uri = `${pispaSyncAPI}/linking/request-consent/${consentRequestId}/pass-credential`
        const data = {
          // The below credential doesn't match the consentId
          credential: {
            credentialType: 'FIDO',
            status: 'PENDING',
            payload: {
              id: 'HskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAtw',
              rawId: "HskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAtw==",
              response: {
                clientDataJSON: "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWXpSaFpHRmlZak16WlRrek1EWmlNRE00TURnNE1UTXlZV1ptWTJSbE5UVTJZelV3WkRneVpqWXdNMlkwTnpjeE1XRTVOVEV3WW1ZelltVmxaalprTmciLCJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjQyMTgxIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ==",
                attestationObject: "o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEcwRQIhAN2JDPPTse/45EHSqSpEJiiok5sns+HqdJch3+gsL09VAiAh7W7ZhQC8gMIkgwcA+S4rQkaHoHnP9AkkohaKCuuA62N4NWOBWQLBMIICvTCCAaWgAwIBAgIECwXNUzANBgkqhkiG9w0BAQsFADAuMSwwKgYDVQQDEyNZdWJpY28gVTJGIFJvb3QgQ0EgU2VyaWFsIDQ1NzIwMDYzMTAgFw0xNDA4MDEwMDAwMDBaGA8yMDUwMDkwNDAwMDAwMFowbjELMAkGA1UEBhMCU0UxEjAQBgNVBAoMCVl1YmljbyBBQjEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEnMCUGA1UEAwweWXViaWNvIFUyRiBFRSBTZXJpYWwgMTg0OTI5NjE5MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEIRpvsbWJJcsKwRhffCrjqLSIEBR5sR7/9VXgfZdRvSsXaiUt7lns44WZIFuz6ii/j9f8fadcBUJyrkhY5ZH8WqNsMGowIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjEwEwYLKwYBBAGC5RwCAQEEBAMCBDAwIQYLKwYBBAGC5RwBAQQEEgQQFJogIY72QTOWuIH41bfx9TAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQA+/qPfPSrgclePfgTQ3VpLaNsBr+hjLhi04LhzQxiRGWwYS+vB1TOiPXeLsQQIwbmqQU51doVbCTaXGLNIr1zvbLAwhnLWH7i9m4ahCqaCzowtTvCQ7VBUGP5T1M4eYnoo83IDCVjQj/pZG8QYgOGOigztGoWAf5CWcUF6C0UyFbONwUcqJEl2QLToa/7E8VRjm4W46IAUljYkODVZASv8h3wLROx9p5TSBlSymtwdulxQe/DKbfNSvM3edA0up+EIJKLOOU+QTR2ZQV46fEW1/ih6m8vcaY6L3NW0eYpc7TXeijUJAgoUtya/vzmnRAecuY9bncoJt8PrvL2ir2kDaGF1dGhEYXRhWMRJlg3liA6MaHQ0Fw9kdmBbj+SuuaKGMseZXPO6gx2XY0EAAAAEFJogIY72QTOWuIH41bfx9QBAHskU2gw4np09IUtYNHnxMM696jJHqvccUdBmd0xP6XEWwH0xLei1PUzDJCM19SZ3A2Ex0fNLw0nc2hrIlFnAt6UBAgMmIAEhWCBYz+SV6fSy7ZjFzdj+SWxaMbfaw4ZT+wYgClN3v93kVSJYIGSzY41DNLrh1jXp4J53qCnq4+b9HYXud/0UEsZquDeV"
              },
              type: "public-key"
            }
          }
        }
        const config: AxiosRequestConfig = {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
        console.log('POST', uri)
        console.log('data', data)
        const expected = {
          errorInformation: {
            errorCode: '7213',
            errorDescription: 'Consent is invalid'
          },
          currentState: "errored"
        }

        // Act
        try {
          await axios.post(uri, data, config)
          throw new Error('Should not be executed')
        } catch (err) {
          // Assert
          expect(err.response.data).toStrictEqual(expected)
          expect(err.response.status).toBe(500)
        }
      })
    })
  })

  describe('pispa <---> bankone OTP to real number', () => {
    it('performs a consentRequest and sends an OTP', async () => {
      // Arrange
      const liveTestNumber = '+61410237238'
      expect(liveTestNumber.length).toBeGreaterThan(0)
      const userId = liveTestNumber.replace('+', '')

      // get the list of accounts
      const uriAccounts =  `${pispaSyncAPI}/linking/accounts/bankone/${userId}`
      const accountsResult = (await axios.get(uriAccounts)).data
      console.log('accountsResult', accountsResult)

      // request consent
      const consentRequestId = v4()
      const uriConsentRequest = `${pispaSyncAPI}/linking/request-consent`
      const data = {
        consentRequestId,
        toParticipantId: 'bankone',
        accounts: accountsResult.accounts,
        actions: [
          'accounts.transfer'
        ],
        userId,
        callbackUri: 'pisp-app://callback'
      }
      const config: AxiosRequestConfig = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
      console.log('POST', uriConsentRequest)
      console.log('data', data)

      const requestConsentResponse = (await axios.post(uriConsentRequest, data, config)).data

      console.log('requestConsentResponse', requestConsentResponse)
    })
  })

  // Shared state for these flow.
  // Each has it's own describe block to ensure tests run in order
  // describe('pisp <---> bankone happy path linking', () => {
  //   // const userId = `61414414414`
  //   // const consentRequestId = v4()
  //   // let accounts: Array<unknown>;
  //   // let consentId: string;

  //   // Hardcode a consentId/thirdparty account link




  // })

  describe('pispa transfer', () => {
    it.todo('allows me to lookup a user based on a social security id alias')
    it.todo('returns an error when I lookup a party that does not exist')
    it.todo('when I enter in a transfer amount, it  returns an authoriztion request with details about the transfer fees')
    it.todo('when I sign the transfer with the example payload, I get confirmation that the transfer was processed')
    it.todo('if I send an invalid signed challenge, I get an error from the DFSP')
  })
})