NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io

up: .thirdparty-demo-server-secret
	kubectl apply -f ./pisp-demo-server.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	kubectl delete -f ./pisp-demo-server.yaml

.thirdparty-demo-server-secret:
	kubectl create secret generic firebase-secret --from-file=../../../../pisp-demo-server/secret/serviceAccountKey.json
	@touch .thirdparty-demo-server-secret

health:
	curl -s ${BASE_URL}/pineapplepay/app/health | jq
	curl -s ${BASE_URL}/pineapplepay/mojaloop/health | jq