NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
BASE_URL=sandbox.mojaloop.io
RELEASE_NAME=unomfi


up:
	kubectl apply -f ./unomfi-simulator.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}
	kubectl delete -f ./unomfi-simulator.yaml

# TODO: update these!
# .contrib-firebase-simulator-secret:
# 	kubectl create secret generic contrib-firebase-simulator --from-file=../../../../contrib-firebase-simulator/config/serviceAccountKey.json
# 	@touch .contrib-firebase-simulator-secret

# .contrib-twilio-secret:
# 	./_create_twilio_secret.sh
# 	@touch .contrib-twilio-secret

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

	