NAMESPACE=ml-app
CHART=mojaloop/ml-testing-toolkit
RELEASE_NAME=otpsim

up:
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yaml

down:
	helm del ${RELEASE_NAME}

