# thirdparty

The thirdparty extensions to the Mojaloop core switch

These will soon be included as part of a default mojaloop install.

- `thirdparty_deployment_base` - base stateful services: mysql instances for oracle, auth-service
- `thirdparty` - Auth Service, Thirdparty API Service, tp variant of tx-requests-service (deprecated)
- `tp-svc` - a testing toolkit instance that mocks the participant list, for `GET /services/{Type}` calls