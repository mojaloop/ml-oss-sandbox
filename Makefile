##
# Mojaloop OSS Sandbox
# Deployment tools
##
SHELL := /bin/bash
PROJECT = "ml-oss-sandbox"
DIR = $(shell pwd)


# custom config:
NAMESPACE = ml-app
BASE_URL = sandbox.mojaloop.io

##
# installation
##
install-switch:
	cd config/switch/base && make up
	cd config/switch/core && make up
	cd config/switch/thirdparty && make up

install-participants:
	cd ./config/participants/applebank/ && make up
	cd ./config/participants/bananabank/ && make up
	cd ./config/participants/bankone/ && make up
	cd ./config/participants/carrotmm/ && make up
	cd ./config/participants/duriantech/ && make up
	cd ./config/participants/eggmm/ && make up
	cd ./config/participants/figmm/ && make up
	cd ./config/participants/pineapplepay/ && make up
	cd ./config/participants/pispa/ && make up
	cd ./config/participants/unomfi/ && make up

install-tools:
	cd ./config/tools/dev-portal/ && make up
	cd ./config/tools/ml-operator/ && make up
	cd ./config/tools/ttk-otpsim/ && make up
	cd ./config/tools/ttk-switch/ && make up

##
# application tools
##
run-ml-bootstrap: run-ml-bootstrap-hub run-ml-bootstrap-participants run-ml-bootstrap-parties

run-ml-bootstrap-hub:
	ELB_URL=${BASE_URL}/api/admin
	FSPIOP_URL=${BASE_URL}/api/fspiop  
	npx ml-bootstrap hub -c ./config/ml-bootstrap.json5

run-ml-bootstrap-participants:
	ELB_URL=${BASE_URL}/api/admin
	FSPIOP_URL=${BASE_URL}/api/fspiop  
	npx ml-bootstrap partcipants -c ./config/ml-bootstrap.json5

run-ml-bootstrap-parties:
	ELB_URL=${BASE_URL}/api/admin
	FSPIOP_URL=${BASE_URL}/api/fspiop  
	npx ml-bootstrap parties -c ./config/ml-bootstrap.json5


##
# uninstallation
##
uninstall-switch:
	cd config/switch/core && make down
	cd config/switch/thirdparty && make down
	@echo 'Warning: not uninstalling base charts - do it yourself with `cd ./config/switch/base && make down`'

uninstall-participants:
	cd ./config/participants/applebank/ && make down
	cd ./config/participants/bananabank/ && make down
	cd ./config/participants/bankone/ && make down
	cd ./config/participants/carrotmm/ && make down
	cd ./config/participants/duriantech/ && make down
	cd ./config/participants/eggmm/ && make down
	cd ./config/participants/figmm/ && make down
	cd ./config/participants/pineapplepay/ && make down
	cd ./config/participants/pispa/ && make down
	cd ./config/participants/unomfi/ && make down

uninstall-tools:
	cd ./config/tools/dev-portal/ && make down
	cd ./config/tools/ml-operator/ && make down
	cd ./config/tools/ttk-otpsim/ && make down
	cd ./config/tools/ttk-switch/ && make down


##
# Tests
##
test-regression:
	./node_modules/.bin/jest ./test/regression/** --runInBand

##
# Utils
##
health-check: health-switch health-participants health-tools


health-switch:
	cd ./config/switch/core/ && make health
	cd ./config/switch/thirdparty/ && make health
	
health-participants:
	cd ./config/participants/applebank/ && make health
	cd ./config/participants/bananabank/ && make health
	cd ./config/participants/bankone/ && make health
	cd ./config/participants/carrotmm/ && make health
	cd ./config/participants/duriantech/ && make health
	cd ./config/participants/eggmm/ && make health
	cd ./config/participants/figmm/ && make health
	cd ./config/participants/pineapplepay/ && make health
	cd ./config/participants/pispa/ && make health
	cd ./config/participants/unomfi/ && make health

health-tools:
	cd ./config/tools/dev-portal/ && make health
	cd ./config/tools/ml-operator/ && make health
	cd ./config/tools/ttk-otpsim/ && make health
	cd ./config/tools/ttk-switch/ && make health


get-urls:
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/applebank/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/bananabank/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/bankone/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/carrotmm/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/duriantech/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/eggmm/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/figmm/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/pineapplepay/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/pispa/endpoints | jq
	curl -s sandbox.mojaloop.io/api/admin/central-ledger/participants/unomfi/endpoints | jq

# list-dfsp-accounts:
# 	curl -s beta.moja-lab.live/api/admin/central-ledger/participants/applebank | jq
# 	curl -s beta.moja-lab.live/api/admin/central-ledger/participants/bananabank | jq
# 	curl -s beta.moja-lab.live/api/admin/central-ledger/participants/carrotmm| jq
# 	curl -s beta.moja-lab.live/api/admin/central-ledger/participants/duriantech | jq
# 	curl -s beta.moja-lab.live/api/admin/central-ledger/participants/eggmm | jq
# 	curl -s beta.moja-lab.live/api/admin/central-ledger/participants/figmm | jq


##
# Monitoring Tools
##

kafka-list:
	kubectl exec testclient -- kafka-topics --zookeeper kafka-zookeeper:2181 --list

mysql-show-tables:
	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword central_ledger -e "show tables"

mysql-describe-transfer:
	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword central_ledger -e "describe transfer"

mysql-login:
	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword central_ledger

mysql-drop-database:
	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword -e "drop database central_ledger; create database central_ledger"
	kubectl exec -it pod/mysql-als-0 -- mysql -u root -ppassword -e "drop database account_lookup; create database account_lookup"
	kubectl exec -it pod/als-consent-oracle-mysql-0 -- mysql -u root -ppassword -e "drop database als-consent-oracle; create database als-consent-oracle"


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

# alternative to the above - in case you want to use the locally checked out mojaloop charts
# for development
install-switch-local: .install-base
	# package local charts
	# cd ../helm; ./package.sh
	helm upgrade --install --namespace ${NAMESPACE} mojaloop ../helm/mojaloop -f ./config/values-oss-lab-v2.yaml

##
# WIP - sections still a work in progress
## 

_add_elastic_indexes:
	curl -X PUT "http://beta.moja-lab.live/monitoring/elasticsearch/_ilm/policy/mojaloop_rollover_policy?pretty" \
		-H 'Content-Type: application/json' \
		-d @policy-rollover-mojaloop.json

	curl -X PUT "http://beta.moja-lab.live/monitoring/elasticsearch/_template/moja_template?pretty" \
		-H 'Content-Type: application/json' \
		-d @template-mojaloop.json

	curl -X GET "http://beta.moja-lab.live/monitoring/elasticsearch/_ilm/policy/mojaloop_rollover_policy?" | jq
	curl -X GET "http://beta.moja-lab.live/monitoring/elasticsearch/_template/moja_template" | jq


install-monitoring:
	# helm upgrade --install --namespace ${NAMESPACE} promfana mojaloop/promfana
	# kubectl apply -f ./charts/networkpolicy_monitoring.yaml

	helm upgrade --install --namespace ${NAMESPACE} efk mojaloop/efk --values ./config/values-efk.yaml
	kubectl apply -f ./charts/ingress_monitoring.yaml

	@#install the event stream processor
	helm upgrade --install --namespace ${NAMESPACE} event-stream-processor mojaloop/eventstreamprocessor --values ./config/values-event-stream-processor.yaml

	# Note: potential race condition here...
	@# add elastic indexes etc
	make _add_elastic_indexes

	# @echo -e 'Use these details to login to Grafana:\nUsername:'
	# @kubectl get secrets/promfana-grafana -o 'go-template={{index .data "admin-user"}}' | base64 -d
	# @echo -e '\npassword:'
	# @kubectl get secrets/promfana-grafana -o 'go-template={{index .data "admin-password"}}' | base64 -d

	# TODO: for now, use lens to do magic port forwarding, but we need to expose the ingress better
	@echo -e 'Log in to kibana here:\n\thttp://kibana.beta.moja-lab.live/app/home'



uninstall-monitoring:
	helm delete event-stream-processor
	helm delete efk
	# helm delete promfana
	kubectl delete -f ./charts/ingress_monitoring.yaml
