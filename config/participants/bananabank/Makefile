NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} bananabank ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del bananabank

health:
	curl -s bananabank-backend.${BASE_URL} | jq
	curl -s bananabank-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s bananabank-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
