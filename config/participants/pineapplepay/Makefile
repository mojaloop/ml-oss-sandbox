NAMESPACE=ml-app

up:
	kubectl apply -f ./pisp-demo-server.yaml
	kubectl apply -f ./ingress.yaml

down:
	kubectl delete -f ./ingress.yaml
	kubectl delete -f ./pisp-demo-server.yaml
