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
	curl -s ${BASE_URL}/carrotmm/sdk-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/carrotmm/sdk-scheme-adapter/outbound/health | jq
	curl -s ${BASE_URL}/carrotmm/thirdparty-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/carrotmm/thirdparty-scheme-adapter/outbound/health | jq
