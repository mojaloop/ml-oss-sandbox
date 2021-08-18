
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
	curl -s ${BASE_URL}/applebank/sdk-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/applebank/sdk-scheme-adapter/outbound/health | jq
	curl -s ${BASE_URL}/applebank/thirdparty-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/applebank/thirdparty-scheme-adapter/outbound/health | jq
