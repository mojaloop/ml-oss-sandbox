NAMESPACE=ml-app

up:
	kubectl apply -f ./ss_mysql.yaml
	kubectl apply -f ./ingress_default_rewrite.yaml
	@touch up

down:
	kubectl delete -f ../ss_mysql.yaml

clean:
	rm -rf up