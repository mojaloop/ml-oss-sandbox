NAMESPACE=ml-app
CHART=../../../thirdparty-simulators

up:
	kubectl apply -f ./contrib-firebase-simulator.yaml
	helm upgrade --install --namespace ${NAMESPACE} bankone ${CHART} --values ./values.yml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del bananabank
	kubectl delete -f ./contrib-firebase-simulator.yaml

