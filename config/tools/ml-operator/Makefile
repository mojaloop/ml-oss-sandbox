NAMESPACE=ml-app
CHART=../../../../helm/ml-operator
RELEASE_NAME=ml-operator


up:
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yml

down:
	helm del ${RELEASE_NAME}

