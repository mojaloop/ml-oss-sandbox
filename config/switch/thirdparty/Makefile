NAMESPACE=ml-app
CHART=../../../charts/thirdparty
RELEASE_NAME=thirdparty
BASE_URL=sandbox.mojaloop.io

up:
	kubectl apply -f ./thirdparty_deployment_base.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART}
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}

health:	
	# TODO: fix me!
	curl -s ${BASE_URL}/api/admin/als-consent-oracle/health | jq
	curl -s $(ELB_URL)/auth-service/health | jq

	@echo 'Checking health of thirdparty services'
	curl -s ${BASE_URL}/api/admin/thirdparty-api-adapter/health | jq
	curl -s ${BASE_URL}/api/admin/thirdparty-tx-requests-service/health | jq

