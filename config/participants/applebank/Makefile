
NAMESPACE=ml-app
CHART=../../../charts/thirdparty-simulators

up:
	helm upgrade --install --namespace ${NAMESPACE} applebank ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del applebank

