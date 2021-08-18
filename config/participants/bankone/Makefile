NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
RELEASE_NAME=bankone


up: .contrib-firebase-simulator-secret
	kubectl apply -f ./contrib-firebase-simulator.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}
	kubectl delete -f ./contrib-firebase-simulator.yaml

.contrib-firebase-simulator-secret:
	kubectl create secret generic contrib-firebase-simulator --from-file=../../../../contrib-firebase-simulator/config/serviceAccountKey.json
	@touch .contrib-firebase-simulator-secret