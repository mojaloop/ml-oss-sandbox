NAMESPACE=ml-app
CHART=mojaloop/mojaloop-simulator

up:
	helm upgrade --install --namespace ${NAMESPACE} bananabank ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del bananabank

