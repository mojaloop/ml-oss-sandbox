NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
BASE_URL=sandbox.mojaloop.io
RELEASE_NAME=bankone


up: .contrib-twilio-secret  .contrib-firebase-simulator-secret
	kubectl apply -f ./bankone-contrib-firebase-simulator.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}
	kubectl delete -f ./bankone-contrib-firebase-simulator.yaml

.contrib-firebase-simulator-secret:
	kubectl create secret generic contrib-firebase-simulator --from-file=../../../../contrib-firebase-simulator/config/serviceAccountKey.json
	@touch .contrib-firebase-simulator-secret

.contrib-twilio-secret:
	./_create_twilio_secret.sh
	@touch .contrib-twilio-secret

health:
	curl -s $(BASE_URL)/bankone-backend/app/health | jq
# website... will print a lot of stuff
	curl -s $(BASE_URL)/bankone | wc -l 
# make sure nested paths work
	curl -s $(BASE_URL)/bankone/style.css

# scheme adapters
	curl -s bankone-sdk-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s bankone-sdk-scheme-adapter-outbound.${BASE_URL}/health | jq
	curl -s bankone-thirdparty-scheme-adapter-inbound.${BASE_URL}/health | jq
	curl -s bankone-thirdparty-scheme-adapter-outbound.${BASE_URL}/health | jq

	