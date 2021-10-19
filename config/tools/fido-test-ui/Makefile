NAMESPACE=ml-app
BASE_URL=sandbox.mojaloop.io

up:
	kubectl apply -f ./fido_test_ui.yaml

down:
	kubectl delete -f ./fido_test_ui.yaml

health:
	curl -s ${BASE_URL} | wc -l
	