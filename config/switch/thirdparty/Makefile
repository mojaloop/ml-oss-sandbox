NAMESPACE=ml-app
CHART=../../../charts/thirdparty
RELEASE_NAME=thirdparty

up:
	kubectl apply -f ./thirdparty_deployment_base.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART}
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}