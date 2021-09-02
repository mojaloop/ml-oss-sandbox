NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
BASE_URL=sandbox.mojaloop.io
RELEASE_NAME=unomfi


up: .contrib-unomfi-simulator-secret
	kubectl apply -f ./unomfi-simulator.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}
	kubectl delete -f ./unomfi-simulator.yaml

.contrib-unomfi-simulator-secret:
	kubectl create secret generic unomfi-simulator-secret \
		--from-file=serviceAccountKey.json=../../../../contrib-firebase-simulator/config/serviceAccountKey.unomfi.json
	@touch .contrib-unomfi-simulator-secret


health:
	curl -s $(BASE_URL)/unomfi-backend/app/health | jq
# website... will print a lot of stuff
	curl -s $(BASE_URL)/unomfi | wc -l 
# make sure nested paths work
	curl -s $(BASE_URL)/unomfi/style.css

# scheme adapters
	curl -s unomfi-sdk-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s unomfi-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
	curl -s unomfi-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s unomfi-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq

	