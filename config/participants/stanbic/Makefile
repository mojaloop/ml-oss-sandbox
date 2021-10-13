NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} stanbic ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del stanbic

health:
	curl -s stanbic-backend.${BASE_URL} | jq
	curl -s stanbic-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s stanbic-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
