NAMESPACE=ml-app

up: .thirdparty-demo-server-secret
	kubectl apply -f ./pisp-demo-server.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	kubectl delete -f ./pisp-demo-server.yaml

.thirdparty-demo-server-secret:
	kubectl create secret generic firebase-secret --from-file=../../../../pisp-demo-server/secret/serviceAccountKey.json
	@touch .thirdparty-demo-server-secret
