
import axios, { AxiosRequestConfig } from 'axios'
import { v4 } from 'uuid'

const baseUrl = 'sandbox.mojaloop.io'
const pispaSyncAPI = `http://pispa-thirdparty-scheme-adapter-outbound.${baseUrl}`

describe('pisp sync API', () => {

  // Shared state for this flow - so each has it's own describe block to ensure tests run in order
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
  })


  // describe('pispa linking', () => {
  //   const userId = `61414414414`
  //   const consentRequestId = v4()
  //   let accounts: Array<unknown>;

  //   it('gets a list of available providers', async () => {
  //     // Arrange
  //     const uri = `${pispaSyncAPI}/linking/providers`
  //     console.log('GET', uri)
  //     const expected = {
  //       currentState: 'providersLookupSuccess',
  //       providers: [
  //         'bankone',
  //       ],
  //     }

  //     // Act
  //     const response = (await axios.get(uri, {})).data
      
      
  //     // Assert
  //     expect(response).toStrictEqual(expected)
  //   })

  //   it('gets a list of accounts for linking from bankone', async () => {
  //     // Arrange
  //     const uri = `${pispaSyncAPI}/linking/accounts/bankone/${userId}`
  //     console.log('GET', uri)
  //     const expected = {
  //       accounts: [
  //         {
  //           accountNickname: 'Everyday Spend',
  //           currency: expect.stringMatching('.*'),
  //           id: expect.stringMatching('.*'),
  //         }
  //       ],
  //       currentState: 'COMPLETED'
  //     }

  //     // Act
  //     const response = (await axios.get(uri, {})).data

  //     // Save the accounts list for later:
  //     accounts = response.accounts


  //     // Assert
  //     expect(response).toStrictEqual(expected)
  //   })

  //   // TODO: come back to this - waiting on a fix for the BankOne Simulator
  //   it.skip('returns an appropriate error when the accounts cannot be found', async () => {
  //     // Arrange
  //     const uri = `${pispaSyncAPI}/linking/accounts/bankone/blablabla`
  //     console.log('GET', uri)
  //     // const expected = {}

  //     // Act 
  //     try {
  //       await axios.get(uri, {})
  //       throw new Error('Should not be executed!')
  //     } catch(err) {
  //       console.log(err.response)


  //       // Assert
  //       expect(err.response.status).toBe(404)
  //     }
  //   })

  //   it('sends an OTP to my phone number when I start the consentRequest process', async () => {
  //     // Arrange

  //     //temp debugging - remove this later on...
  //     accounts = [
  //       {
  //         accountNickname: 'Everyday Spend',
  //         id: '369f8bcf6870743d528026fb65439af185926c781705134fb456fd9d52e40518',
  //         currency: 'TZS'
  //       }
  //     ]

  //     expect(accounts).toBeDefined()
  //     expect(userId).toBeDefined()

  //     /*
  //     curl -X POST 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent' \
  //       -H  'accept: application/json' \
  //       -H  'Content-Type: application/json' -d '{\'consentRequestId\':\'f6ab43b0-71cc-49f9-b763-2ac3f05ac8c1\',\'toParticipantId\':\'dfspa\',\'accounts\':[{\'accountNickname\':\'SpeXXXXXXXXnt\',\'id\':\'dfspa.username.5678\',\'currency\':\'USD\'}],\'actions\':[\'accounts.transfer\'],\'userId\':\'username1234\',\'callbackUri\':\'pisp-app://callback\'}'

  //     */
  //     const uri = `${pispaSyncAPI}/linking/request-consent`
  //     const data = {
  //       consentRequestId,
  //       toParticipantId: 'bankone',
  //       accounts,
  //       actions:[
  //         'accounts.transfer'
  //       ],
  //       userId,
  //       callbackUri: 'pisp-app://callback'
  //     }
  //       // callbackUri\':\'pisp-app://callback\'}'
  //     const config: AxiosRequestConfig = {
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json',
  //       }
  //     }
  //     console.log('POST', uri)
  //     console.log('data', data)
  //     const expected = {
  //       channelResponse: {
  //         authChannels: [ 'OTP'],
  //         callbackUri: 'pisp-app://callback',
  //         consentRequestId, 
  //         scopes: [
  //           {
  //             // @ts-ignore
  //             accountId: accounts[0].id,
  //             actions: ['accounts.transfer']
  //           }
  //         ],
  //       },
  //       currentState: 'OTPAuthenticationChannelResponseRecieved'
  //     }

  //     // Act
  //     const response = (await axios.post(uri, data, config)).data


  //     // Assert
  //     expect(response).toStrictEqual(expected)
  //   })

  //   it.todo('returns an error if I try to link an unknown account')
  //   it.todo('returns an error if I try to link an account with a dfsp that is not bankone')

  //   it.only('returns a Consent object when I send the correct OTP', async () => {
  //     // Arrange
  //     expect(consentRequestId).toBeDefined()

  //     /*
  //       curl -X PATCH 'http://sandbox.mojaloop.io/switch-ttk-backend/linking/request-consent/b51ec534-ee48-4575-b6a9-ead2955b8069/authenticate' \
  //            -H  'accept: application/json' \
  //            -H  'Content-Type: application/json' \
  //            -d '{\'authToken\':\'111222\'}'
  //     */
  //     const uri = `${pispaSyncAPI}/linking/request-consent/${consentRequestId}`
  //     const data = {
  //       // token 111222 is a special token that will alway succeed
  //       authToken: '111222'
  //     }
  //     const config: AxiosRequestConfig = {
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json',
  //       }
  //     }
  //     console.log('PATCH', uri)
  //     console.log('data', data)
  //     const expected = {
       
  //     }

  //     // Act
  //     const response = (await axios.patch(uri, data, config)).data


  //     // Assert
  //     expect(response).toStrictEqual(expected)
  //   })


  //   it.todo('returns an error when I send an incorrect OTP')
  //   it.todo('returns success when I submit a valid credential and signature')
  //   it.todo('returns an error if I send a bad credential or invalid signature')
  //   it.todo('allows me to lookup the consent object with the central auth-service')
  // })

  describe('pispa transfer', () => {
    it.todo('allows me to lookup a user based on a social security id alias')
    it.todo('returns an error when I lookup a party that does not exist')
    it.todo('when I enter in a transfer amount, it  returns an authoriztion request with details about the transfer fees')
    it.todo('when I sign the transfer with the example payload, I get confirmation that the transfer was processed')
    it.todo('if I send an invalid signed challenge, I get an error from the DFSP')
  })
})