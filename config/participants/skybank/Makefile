NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} skybank ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del skybank

health:
	curl -s skybank-backend.${BASE_URL} | jq
	curl -s skybank-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s skybank-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
