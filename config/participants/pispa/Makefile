NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators
RELEASE_NAME=pispa


up:
	kubectl apply -f ./contrib-firebase-simulator.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}
	kubectl delete -f ./contrib-firebase-simulator.yaml

