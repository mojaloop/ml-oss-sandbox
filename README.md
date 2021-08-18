# ml-oss-sandbox

This directory contains common setup notes, configs and scripts for the Mojaloop OSS-Sandbox.

__See the sandbox here: http://sandbox.mojaloop.io__

## Quick Start

<!-- TODO: double check these commands and update!  -->

```bash
# switch, ingress, 3rd party API support and infra
make install-switch

# simulators
make install-participants

# tooling, dev portal, etc.
make install-tools


# TODO: health checks


# seed the environment
make run-ml-bootstrap
```

## Tools

- API Gateway: `Kong`
- Tools
  - dev-portal (./dev-portal) - a simple developer-based homepage for the Sandbox
  - ml-bootstrap - ts based cli tool for 
- testing toolkit instances:
```
eggmm-ttk
figmm-ttk
```


## Configuration:

Nodes: 
- Master: 3x `c5a.large`
- Workers: 2x `m5.xlarge`


```bash
helm list

# output
# NAME     	NAMESPACE	REVISION	UPDATED                                 	STATUS  	CHART                    	APP VERSION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
# eggmm-ttk	ml-app   	1       	2021-01-14 21:48:30.180737085 +1030 ACDT	deployed	ml-testing-toolkit-11.0.0	ml-testing-toolkit: v11.7.0 ml-testing-toolkit-ui: v11.6.2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
# figmm-ttk	ml-app   	1       	2021-01-14 17:39:57.904318701 +1030 ACDT	deployed	ml-testing-toolkit-11.0.0	ml-testing-toolkit: v11.7.0 ml-testing-toolkit-ui: v11.6.2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
# kong     	ml-app   	8       	2021-01-06 13:16:18.272471609 +1030 ACDT	deployed	kong-1.12.0              	2.2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
# mojaloop 	ml-app   	3       	2021-01-15 23:17:16.716083257 +1030 ACDT	failed  	mojaloop-11.0.0          	ml-api-adapter: v11.1.2; central-ledger: v11.3.1; account-lookup-service: v11.1.2; quoting-service: v11.1.4; central-settlement: v10.5.0; central-event-processor: v10.5.0; bulk-api-adapter: v11.0.2; email-notifier: v9.5.0; als-oracle-pathfinder: v10.2.0; transaction-requests-service: v11.1.2; finance-portal-ui: v10.4.0; finance-portal-backend-service: v10.4.0; settlement-management: v8.8.2; operator-settlement: v9.2.1; simulator: v11.0.2; mojaloop-simulator: v11.2.1; sdk-scheme-adapter: v11.8.0; ml-testing-toolkit: v11.5.0 ml-testing-toolkit-ui: v11.5.0; ml-testing-toolkit-cli: v11.3.0
# ppmm-ttk 	ml-app   	1       	2021-01-15 21:50:56.663196456 +1030 ACDT	deployed	ml-testing-toolkit-11.0.0	ml-testing-toolkit: v11.7.0 ml-testing-toolkit-ui: v11.6.2    
```

## Endpoints:

- [beta.moja-lab.live](http://beta.moja-lab.live)
```
# health checks:
http://beta.moja-lab.live/api/admin/participants/health
http://beta.moja-lab.live/api/admin/parties/health
http://beta.moja-lab.live/api/admin/transactionRequests/health
http://beta.moja-lab.live/api/admin/authorizations/health
http://beta.moja-lab.live/api/admin/quotes/health
http://beta.moja-lab.live/api/admin/transfers/health

# FSPIOP API endpoints
http://beta.moja-lab.live/api/fspiop/participants
http://beta.moja-lab.live/api/fspiop/parties
http://beta.moja-lab.live/api/fspiop/transactionRequests
http://beta.moja-lab.live/api/fspiop/authorizations
http://beta.moja-lab.live/api/fspiop/quotes
http://beta.moja-lab.live/api/fspiop/transfers

# Admin API
http://beta.moja-lab.live/api/admin/central-ledger
http://beta.moja-lab.live/api/admin/account-lookup-service
http://beta.moja-lab.live/api/admin/account-lookup-service-admin


# TTKs
http://switch-ttk.beta.moja-lab.live
```



## TODOs
- [ ] persistent databases
- [ ] update guides to remove testfsp
- [ ] auto configure resetting once a week
- [ ] rancher auto replace
- [ ] switch to proper ml-bootstrap
- [ ] gitops? Or some other, better way to manage?
- [ ] fix broken guide #2 transfers
- [ ] turn on auto-accept quotes, so that simulator-ui works again
- [ ] double check other guides - Simulator, TTK P2P





Port forward command:

kubectl port-forward -n ml-app service/promfana-grafana 35395:80


## Debugging Elasticsearch stuff

_reference_: https://github.com/mojaloop/event-stream-processor#1111-create


```bash
curl -X PUT "http://beta.moja-lab.live/monitoring/elasticsearch/_ilm/policy/mojaloop_rollover_policy?pretty" \
  -H 'Content-Type: application/json' \
  -d @policy-rollover-mojaloop.json

curl -X PUT "http://beta.moja-lab.live/monitoring/elasticsearch/_template/moja_template?pretty" \
  -H 'Content-Type: application/json' \
  -d @template-mojaloop.json

curl -X GET "http://beta.moja-lab.live/monitoring/elasticsearch/_ilm/policy/mojaloop_rollover_policy?"
curl -X GET "http://beta.moja-lab.live/monitoring/elasticsearch/_template/moja_template"
```



### Running Kafkacat and tailing kafka

```bash
helm install -n ml-app kafkacat cord/kafkacat    
kubectl get po | grep kafkaca
kubectl exec -it kafkacat-d6457c947-cdf8j sh         

#then, inside the pod:
kafkacat -b mojaloop-kafka:9092 -t topic-event | jq
```