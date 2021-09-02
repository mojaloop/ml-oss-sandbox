NAMESPACE=ml-app

up:
	kubectl apply -f ./ss_mysql.yaml
	kubectl apply -f ./ingress_default_rewrite.yaml
	helm upgrade --install --namespace ${NAMESPACE} kong kong/kong -f ./kong_values.yaml

	@touch up

down:
	kubectl delete -f ../ss_mysql.yaml

truncate-databases:
	kubectl exec -it pod/mysql-cl-0 -- mysql -u root -ppassword -e "drop database central_ledger; create database central_ledger"
	kubectl exec -it pod/mysql-als-0 -- mysql -u root -ppassword -e "drop database account_lookup; create database account_lookup"
	kubectl exec -it pod/mysql-oracle-consent-0 -- mysql -u root -ppassword -e "drop database oracle_consent; create database oracle_consent"
	#kubectl exec -it pod/mysql-auth-service-0 -- mysql -u root -ppassword -e "drop database 'auth-service'; create database 'auth-service'"

clean:
	rm -rf up