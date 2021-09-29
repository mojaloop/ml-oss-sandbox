NAMESPACE=ml-app
CHART=mojaloop/mojaloop
RELEASE_NAME=mojaloop
BASE_URL=sandbox.mojaloop.io

up:
	helm upgrade --install --namespace ${NAMESPACE} ${RELEASE_NAME} ${CHART} --values ./values.yaml
	kubectl apply -f ./ingress_kong_fspiop.yaml
	kubectl apply -f ./ingress_kong_admin.yaml

down:
	kubectl delete -f ./ingress_kong_fspiop.yaml
	kubectl delete -f ./ingress_kong_admin.yaml
	helm del ${RELEASE_NAME}

health:
	curl -s ${BASE_URL}/api/admin/central-ledger/health | jq
	curl -s ${BASE_URL}/api/admin/ml-api-adapter/health | jq
	curl -s ${BASE_URL}/api/admin/account-lookup-service/health | jq
	curl -s ${BASE_URL}/api/admin/account-lookup-service-admin/health | jq
	curl -s ${BASE_URL}/api/admin/oracle-simulator/health | jq
	curl -s ${BASE_URL}/api/admin/quoting-service/health | jq
	curl -s ${BASE_URL}/api/admin/transaction-requests-service/health | jq
