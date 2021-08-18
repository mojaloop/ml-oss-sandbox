NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io

up:
	kubectl apply -f ./dev_portal.yaml

down:
	kubectl delete -f ./dev_portal.yaml

health:
	curl -s ${BASE_URL} | wc -l
	