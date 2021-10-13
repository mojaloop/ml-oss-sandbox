NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} mtn ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del mtn

health:
	curl -s mtn-backend.${BASE_URL} | jq
	curl -s mtn-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s mtn-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
