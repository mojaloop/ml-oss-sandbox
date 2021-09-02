NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
BASE_URL=sandbox.mojaloop.io
RELEASE_NAME=paynow

up:
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}

health:
	curl -s paynow-backend.${BASE_URL} | jq
	curl -s paynow-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s paynow-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq
