NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} carrotmm ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del carrotmm

health:
	curl -s carrotmm-backend.${BASE_URL} | jq
	curl -s carrotmm-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s carrotmm-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
