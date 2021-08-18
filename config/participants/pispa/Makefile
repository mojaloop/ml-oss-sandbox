NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
BASE_URL=sandbox.mojaloop.io
RELEASE_NAME=pispa

up:
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}

health:
	curl -s pispa-backend.${BASE_URL} | jq
	curl -s pispa-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s pispa-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq
