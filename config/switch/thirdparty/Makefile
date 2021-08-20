NAMESPACE=ml-app
CHART=../../../charts/thirdparty
RELEASE_NAME=thirdparty
BASE_URL=sandbox.mojaloop.io

up:
	kubectl apply -f ./thirdparty_deployment_base.yaml
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART}
	helm upgrade --install \
		--namespace ${NAMESPACE} \
		tp-svc \
		mojaloop/ml-testing-toolkit \
		--values ./tp-svc.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	helm del ${RELEASE_NAME}
	helm del tp-svc

health:	
	@echo 'Checking health of thirdparty services'
	curl -s ${BASE_URL}/api/admin/oracle-consent/health | jq
	curl -s ${BASE_URL}/api/admin/thirdparty-api-adapter/health | jq
	curl -s ${BASE_URL}/api/admin/thirdparty-tx-requests-service/health | jq
	curl -s $(BASE_URL)/api/admin/auth-service/health | jq
	curl -s tp-svc.sandbox.mojaloop.io/services/THIRD_PARTY_DFSP \
		-H "Date: hello"\
		-H "FSPIOP-Source: pispa"

