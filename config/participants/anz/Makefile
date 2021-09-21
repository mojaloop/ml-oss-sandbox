
NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=../../../charts/thirdparty-simulators

up:
	helm upgrade --install --namespace ${NAMESPACE} anz ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del anz

health:
	curl -s anz-backend.${BASE_URL} | jq
	curl -s anz-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s anz-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
	curl -s anz-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s anz-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq
