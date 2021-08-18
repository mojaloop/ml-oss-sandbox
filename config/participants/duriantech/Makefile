NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} duriantech ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del duriantech

health:
	curl -s ${BASE_URL}/duriantech/sdk-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/duriantech/sdk-scheme-adapter/outbound/health | jq
	curl -s ${BASE_URL}/duriantech/thirdparty-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/duriantech/thirdparty-scheme-adapter/outbound/health | jq
