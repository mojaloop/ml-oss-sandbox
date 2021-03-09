##
# Mojaloop OSS Sandbox
# Deployment tools
##
SHELL := /bin/bash
PROJECT = "ml-oss-sandbox"
DIR = $(shell pwd)


# custom config:
NAMESPACE = ml-app
BASE_URL = beta.moja-lab.live

##
# Runners
##
install-switch: .install-base
	helm upgrade --install --namespace ${NAMESPACE} mojaloop mojaloop/mojaloop -f ./config/values-oss-lab-v2.yaml

# alternative to the above - in case you want to use the locally checked out mojaloop charts
# for development
install-switch-local: .install-base
	# package local charts
	# cd ../helm; ./package.sh
	helm upgrade --install --namespace ${NAMESPACE} mojaloop ../helm/mojaloop -f ./config/values-oss-lab-v2.yaml

install-ingress:
	helm upgrade --install --namespace ${NAMESPACE} kong kong/kong -f ./config/kong_values.yaml
	# TODO: figure out a better way to apply multi files
	kubectl apply -f ./charts/ingress_kong_admin.yaml
	kubectl apply -f ./charts/ingress_kong_fspiop.yaml
	kubectl apply -f ./charts/ingress_simulators.yaml
	kubectl apply -f ./charts/ingress_ttk.yaml

install-dev-portal:
	kubectl apply -f ./config/dev_portal.yaml

# Vanilla Simulators using standalone simulator chart
# for simulators including PISP support - refer to `install-thirdparty-simulators`
install-simulators:
	helm upgrade --install --namespace ${NAMESPACE} simulators mojaloop/mojaloop-simulator --values ./config/values-oss-lab-simulators.yaml
	kubectl apply -f ./charts/ingress_simulators.yaml

install-ttk:
	helm upgrade --install --namespace ${NAMESPACE} figmm-ttk mojaloop/ml-testing-toolkit --values ./config/values-ttk-figmm.yaml
	helm upgrade --install --namespace ${NAMESPACE} eggmm-ttk mojaloop/ml-testing-toolkit --values ./config/values-ttk-eggmm.yaml

# Installs mojaloop thirdparty charts alongside a vanilla Mojaloop install
install-thirdparty:
	# install the databases separately
	kubectl apply -f ./charts/thirdparty/thirdparty_deployment_base.yaml
	# install the chart
	helm upgrade --install --namespace ${NAMESPACE} thirdparty ./charts/thirdparty

install-thirdparty-simulators: .thirdparty-demo-server-secret
	# pisp-demo-server, required for pineapple pay/demo app flutter
	kubectl apply -f ./charts/thirdparty-simulators/pisp-demo-server.yaml
	# Applebank
	helm upgrade --install --namespace ${NAMESPACE} thirdparty-simulators ./charts/thirdparty-simulators --values ./config/values-applebank.yaml

run-ml-bootstrap:
	ELB_URL=${BASE_URL}/api/admin
	FSPIOP_URL=${BASE_URL}/api/fspiop  
	echo ${ELB_URL}
	# TODO: change to the proper location!
	# TODO: config file!
	# TODO: run ml-bootstrap inline with npx
	cd ../ml-bootstrap && npm run ml-bootstrap -- hub -c ../ml-oss-sandbox/config/ml-bootstrap.json5
	cd ../ml-bootstrap && npm run ml-bootstrap -- participants -c ../ml-oss-sandbox/config/ml-bootstrap.json5
	cd ../ml-bootstrap && npm run ml-bootstrap -- parties -c ../ml-oss-sandbox/config/ml-bootstrap.json5

uninstall-switch:
	helm delete mojaloop

uninstall-ingress:
	helm delete kong
	kubectl delete -f ./charts/ingress_kong_admin.yaml
	kubectl delete -f ./charts/ingress_kong_fspiop.yaml
	kubectl delete -f ./charts/ingress_simulators.yaml
	kubectl delete -f ./charts/ingress_ttk.yaml

uninstall-thirdparty:
	@echo "todo!"

uninstall-thirdparty-simulators:
	kubectl apply -f ./charts/thirdparty-simulators/pisp-demo-server.yaml
	helm delete thirdparty-simulators

uninstall-base:
	kubectl delete -f ./charts/base/ss_mysql.yaml
	# helm install kafka public/kafka --values ./charts/base/kafka_values.yaml
	rm -rf .install-base


##
# Utils
##
health-thirdparty-simulators:
	curl -s ${BASE_URL}/pineapple/app/health | jq
	curl -s ${BASE_URL}/pineapple/mojaloop/health | jq
	# no health check here, but we can just check the list of parties registered
	curl -s ${BASE_URL}/applebank/simulator/repository/parties | jq
	curl -s ${BASE_URL}/applebank/sdk-scheme-adapter/health | jq
	curl -s ${BASE_URL}/applebank/thirdparty-scheme-adapter/inbound/health | jq
	curl -s ${BASE_URL}/applebank/thirdparty-scheme-adapter/outbound/health | jq


##
# Stateful make commands
#
# These create respective `.command-name` files to stop make from
# running the same command multiple times
##
.add-repos:
	helm repo add public https://charts.helm.sh/incubator
	helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
	@touch .add-repos

# Installs base prerequisites: kafka and mysql
.install-base:
	kubectl apply -f ./charts/base/ss_mysql.yaml
	# helm install kafka public/kafka --values ./charts/base/kafka_values.yaml
	@touch .install-base


# .install-base:
# 	kubectl apply -f ./charts-base/deployment_setup.yaml
# 	helm install kafka public/kafka --values ./charts-base/kafka_values.yaml
# 	helm install nginx ingress-nginx/ingress-nginx --version 2.16.0
# 	@touch .install-base

.thirdparty-demo-server-secret:
	kubectl create secret generic firebase-secret --from-file=../pisp-demo-server/secret/serviceAccountKey.json
	@touch .thirdparty-demo-server-secret


# clean-add-repos:
# 	@rm -rf .add-repos

# clean-install-base:
# 	@helm del nginx || echo 'helm del nginx failed - continuing anyway'
# 	@helm del kafka || echo 'helm del kafka failed - continuing anyway'
# 	@kubectl delete -f ./charts-base/deployment_setup.yaml || echo 'kubectl del deployment_setup failed - continuing anyway'
# 	@rm -rf .install-base


# ##
# # Repo Tools
# ##
# .PHONY: clean-repo get-elb


# # Get the url of the loadbalancer created by nginx for us
# get-elb:
# 	$(eval ELB=$(shell kubectl get service/nginx-ingress-nginx-controller -o json | jq -r .status.loadBalancer.ingress[0].hostname))
# 	@echo -e "Run:\n\n    export ELB_URL=$(ELB)\n\nto configure the load balancer url in your local environment"

# clean-repo:
# 	rm -rf $(REPO_DIR)


# ##
# # Monitoring Tools
# ##
# kafka-list:
# 	kubectl exec testclient -- kafka-topics --zookeeper kafka-zookeeper:2181 --list

# mysql-show-tables:
# 	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword central_ledger -e "show tables"

# mysql-describe-transfer:
# 	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword central_ledger -e "describe transfer"

# mysql-login:
# 	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword central_ledger

# mysql-drop-database:
# 	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword -e "drop database central_ledger; create database central_ledger"
# 	kubectl exec -it pod/mysql-als-0 -- mysql -u root -ppassword -e "drop database account_lookup; create database account_lookup"
# 	kubectl exec -it pod/als-consent-oracle-mysql-0 -- mysql -u root -ppassword -e "drop database als-consent-oracle; create database als-consent-oracle"

# health-check: health-check-switch health-check-participants

# health-check-switch:
# 	@echo 'Checking health of switch services'
# 	curl -s $(ELB_URL)/central-ledger/health | jq
# 	# curl -s $(ELB_URL)/auth-service/health | jq
# 	curl -s $(ELB_URL)/quoting-service/health | jq
# 	curl -s $(ELB_URL)/ml-api-adapter/health | jq
# 	curl -s $(ELB_URL)/account-lookup-service/health | jq
# 	curl -s $(ELB_URL)/account-lookup-service-admin/health | jq
# 	curl -s $(ELB_URL)/oracle-simulator/health | jq
# 	curl -s $(ELB_URL)/als-consent-oracle/health | jq

# health-check-participants:
# 	@echo 'Checking health of all participants'
# # note: not all health checks contain a response body
# # so they are commented out - comments are left for completeness
# # dfspa
# # No health check on /inbound
# # curl -s $(ELB_URL)/dfspa/sdk-scheme-adapter/inbound | jq
# 	curl -s $(ELB_URL)/dfspa/sdk-scheme-adapter/outbound | jq
# 	curl -s $(ELB_URL)/dfspa/thirdparty-scheme-adapter/inbound/health | jq
# 	curl -s $(ELB_URL)/dfspa/thirdparty-scheme-adapter/outbound/health | jq
# 	curl -s $(ELB_URL)/dfspa/mojaloop-simulator/simulator | jq
# # No health check on /report or /test
# # curl -s $(ELB_URL)/dfspa/mojaloop-simulator/report/reports | jq
# # curl -s $(ELB_URL)/dfspa/mojaloop-simulator/test | jq

# # dfspb
# # No health check on /inbound
# # curl -s $(ELB_URL)/dfspb/sdk-scheme-adapter/inbound | jq
# 	curl -s $(ELB_URL)/dfspb/sdk-scheme-adapter/outbound | jq
# 	curl -s $(ELB_URL)/dfspb/thirdparty-scheme-adapter/inbound/health | jq
# 	curl -s $(ELB_URL)/dfspb/thirdparty-scheme-adapter/outbound/health | jq
# 	curl -s $(ELB_URL)/dfspb/mojaloop-simulator/simulator | jq
# # No health check on /report or /test
# # curl -s $(ELB_URL)/dfspb/mojaloop-simulator/report | jq
# # curl -s $(ELB_URL)/dfspb/mojaloop-simulator/test | jq

# #pispa
# 	curl -s $(ELB_URL)/pispa/thirdparty-scheme-adapter/inbound/health | jq
# 	curl -s $(ELB_URL)/pispa/thirdparty-scheme-adapter/outbound/health | jq
# 	curl -s $(ELB_URL)/pispa/mojaloop-simulator/simulator | jq
# #@ No health check on /report or /test
# #@ curl -s $(ELB_URL)/pispa/mojaloop-simulator/report | jq
# #@ curl -s $(ELB_URL)/pispa/mojaloop-simulator/test | jq


# transfer-p2p:
# 	./_test_transfer.sh

##
# Kube Tools
##
.PHONY: watch-all switch-kube

# Watch all resources in namespace
watch-all:
	watch -n 1 kubectl get all

# Convenience function to switch back to the kubectx and ns we want
switch-kube:
	kubectx oss-lab-beta
	kubens ${NAMESPACE}
	helm list
