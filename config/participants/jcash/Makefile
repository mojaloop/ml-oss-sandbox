
NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io
CHART=../../../charts/thirdparty-simulators

up:
	helm upgrade --install --namespace ${NAMESPACE} jcash ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del jcash

health:
	curl -s jcash-backend.${BASE_URL} | jq
	curl -s jcash-sdk-scheme-adapter-inbound.${BASE_URL} | jq
	curl -s jcash-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
	curl -s jcash-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s jcash-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq
