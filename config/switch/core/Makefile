NAMESPACE=ml-app
CHART=mojaloop/mojaloop
RELEASE_NAME=mojaloop

up:
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress_kong_fspiop.yaml
	kubectl apply -f ./ingress_kong_admin.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}

