
NAMESPACE=ml-app
CHART=mojaloop/mojaloop-simulator

# bananabank, carrotmm, duriantech
	helm upgrade --install --namespace ${NAMESPACE} simulators mojaloop/mojaloop-simulator --values ./config/values-oss-lab-simulators.yaml
	kubectl apply -f ./charts/ingress_simulators.yaml

up:
	helm upgrade --install --namespace ${NAMESPACE} applebank ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del applebank

