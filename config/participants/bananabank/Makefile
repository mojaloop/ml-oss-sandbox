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
	curl -s ${BASE_URL}/bananabank/sdk-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/bananabank/sdk-scheme-adapter/outbound/health | jq
	curl -s ${BASE_URL}/bananabank/thirdparty-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/bananabank/thirdparty-scheme-adapter/outbound/health | jq
