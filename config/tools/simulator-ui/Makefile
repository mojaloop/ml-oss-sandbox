NAMESPACE=ml-app

up:
	kubectl apply -f ./simulator_ui.yaml

down:
	kubectl delete -f ./simulator_ui.yaml

health:
	curl simulator-ui.sandbox.mojaloop.io
# deprecated
	curl simulator-ui.beta.moja-lab.live