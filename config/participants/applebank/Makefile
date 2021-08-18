
NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=../../../charts/thirdparty-simulators

up:
	helm upgrade --install --namespace ${NAMESPACE} applebank ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del applebank

health:
	curl -s applebank-backend.${BASE_URL} | jq
	curl -s applebank-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s applebank-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
	curl -s applebank-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s applebank-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq
