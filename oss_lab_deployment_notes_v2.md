# OSS Lab Deployment Guide

> Note:
> This file ended up being a scratch pad for the OSS-Lab deployment process
> While it may be good as a reference, expect a lot here to fail
> until @lewisdaly gets around to cleaning it up and turning it into 
> a better user guide

## 1. Spin up the kubernetes cluster

1. Log into rancher, create a new cluster

```
cluster name: oss-lab-beta 
version: 1.17.14-rancher-1-1
master: 3x m5.large
workers: 2x m5.xlarge

```

2. Download kubectl etc.
```bash
kubectx 
# oss-lab-beta

kubectl get po --all-namespaces
```

3. [optional] Install the k8s dashboard

ref: https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/

```bash
# create a service account for the user
kubectl apply -f ./config/ServiceAccount_admin-user.yaml
kubectl create namespace kubernetes-ds
helm --namespace kubernetes-dashboard  install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard
export POD_NAME=$(kubectl get pods -n kubernetes-dashboard -l "app.kubernetes.io/name=kubernetes-dashboard,app.kubernetes.io/instance=kubernetes-dashboard" -o jsonpath="{.items[0].metadata.name}")
kubectl -n kubernetes-dashboard port-forward $POD_NAME 8443:8443

open https://127.0.0.1:8443/

# managed to log in using kubectl - other instructions untested:

# get the secret
kubectl -n kubernetes-dashboard describe secret $(kubectl -n kubernetes-dashboard get secret | grep admin-user | awk '{print $1}')
```


3. Install Mojaloop v11 from Helm

```bash
helm repo add mojaloop http://mojaloop.io/helm/repo/
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm repo add kiwigrid https://kiwigrid.github.io
helm repo add elastic https://helm.elastic.co
helm repo add bitnami https://charts.bitnami.com/bitnami


kubectl create namespace ml-app
# no postman tests... hope this still works
# we can use ml-boostrap to set up the environment
helm upgrade --install --namespace ml-app mojaloop mojaloop/mojaloop -f ./config/values-oss-lab-v2.yaml
# TODO: fix values... remove ingress
# helm upgrade --install --namespace ml-app mojaloop mojaloop/mojaloop -f ./config/values-oss-lab.yaml --wait --timeout 15m

# output:
# NAME: mojaloop
# LAST DEPLOYED: Wed Dec 16 12:34:06 2020
# NAMESPACE: ml-app
# STATUS: deployed
# REVISION: 1
```


## 2. Set Up an Kong API Gateway

1. Installing kong:
```bash
kubens ml-app

helm repo add kong https://charts.konghq.com
helm repo update


#switching to file based config for kong 
helm upgrade --install --namespace ml-app kong kong/kong -f ./config/kong_values.yaml
```


2. Set up some ingress I suppose

```bash
kuebctl apply -f ./charts/ingress_kong_admin.yaml
kuebctl apply -f ./charts/ingress_kong_fspiop.yaml
kuebctl apply -f ./charts/ingress_simulators.yaml
kuebctl apply -f ./charts/ingress_ttk.yaml

# health checks:
http://beta.moja-lab.live/api/admin/participants/health
http://beta.moja-lab.live/api/admin/parties/health
http://beta.moja-lab.live/api/admin/transactionRequests/health
http://beta.moja-lab.live/api/admin/authorizations/health
http://beta.moja-lab.live/api/admin/quotes/health
http://beta.moja-lab.live/api/admin/transfers/health

# FSPIOP API endpoints
http://beta.moja-lab.live/api/fspiop/participants
http://beta.moja-lab.live/api/fspiop/parties
http://beta.moja-lab.live/api/fspiop/transactionRequests
http://beta.moja-lab.live/api/fspiop/authorizations
http://beta.moja-lab.live/api/fspiop/quotes
http://beta.moja-lab.live/api/fspiop/transfers

# Admin API
http://beta.moja-lab.live/api/admin/central-ledger
http://beta.moja-lab.live/api/admin/account-lookup-service
http://beta.moja-lab.live/api/admin/account-lookup-service-admin

# k8s dashboard? That would be nice...
https://dashboard.beta.moja-lab.live

# PISP API
TODO!!
```

## 3. Deploy Dev Tools

### 3.1 Dev Portal
```bash
cd dev-portal
docker-compose build
docker push lewisdaly/dev-portal:latest

kubectl apply -f ./config/dev-portal.yaml
```

### 3.2 Deploy Simulators
```bash
helm upgrade --install --namespace ml-app simulators mojaloop/mojaloop-simulator --values ./config/values-oss-lab-simulators.yaml

kubectl apply -f ./charts/ingress_simulators.yaml

curl payeefsp-backend.beta.moja-lab.live/repository/parties

```

### 3.3 Set up TTKs

```bash
# 2 ttk instances?
helm upgrade --install --namespace ml-app figmm-ttk mojaloop/ml-testing-toolkit --values ./config/values-ttk-figmm.yaml
helm upgrade --install --namespace ml-app eggmm-ttk mojaloop/ml-testing-toolkit --values ./config/values-ttk-eggmm.yaml
```

### 3.4 Seed Environment!

```bash
# TODO: wait for k8s upgrade
# ml-bootstrap time!
# Maybe just use the legacy for now

export ELB_URL=beta.moja-lab.live/api/admin
export FSPIOP_URL=beta.moja-lab.live/api/fspiop  

cd ../ml-bootstrap
npm run reseed:docker-live
```

## 4 - Other Applications

### 4.1 - PISP TTK + PISP Demo Server

- PISP Demo Server - https://github.com/mojaloop/pisp-demo-server - Acts as PISP backend. It predates the thirdparty-scheme-adapter, and integrates with the pisp-demo-app-flutter project
- PISP TTK - A customized version of the Testing Toolkit that speaks v0.1 of the PISP API Draft


```bash
# create a secret for the serviceAccountKey.json file
kubectl create secret generic firebase-secret --from-file=../../pisp-demo-server/secret/serviceAccountKey.json

# install the demo server
kubectl apply -f ./pisp-demo/pisp-demo-server.yaml

# check that you can access the health check
curl beta.moja-lab.live/pineapple/app/health | jq
curl beta.moja-lab.live/pineapple/mojaloop/health | jq

# install the ttk with pisp apis
helm upgrade --install --namespace ml-app tp-ttk mojaloop/ml-testing-toolkit --values ./pisp-demo/tp-ttk.yaml

# expose the 3p-ttk
kubectl apply -f ./pisp-demo/ingress-tp-ttk.yaml

# now go to: http://tp-ttk.beta.moja-lab.live
```


### 4.2 - Mojaloop Bulk

[ todo - look more into this... ]
## Known Issues:

### settlement account ids are hardcoded:

When running ml-boostrap, if you see:
```
  - step: create settlement account
executeRequest failed with status: 500
{
  errorInformation: {
    errorCode: '2001',
    errorDescription: 'Internal server error - The account does not match participant or currency specified'
  }
}
```

You need to get the settlement account ids, and put them into the config file:

```bash
curl -s $ELB_URL/central-ledger/participants | jq

# look for the id of `HUB_MULTILATERAL_SETTLEMENT` and edit the config file

# then run again
npm run reseed:docker-live 
```
### No https support

https://aws.amazon.com/premiumsupport/knowledge-center/terminate-https-traffic-eks-acm/

1. ACM > Request Certificate > Request Certificate for `beta.moja-lab.live` and `*.beta.moja-lab.live`

arn is:  
```
arn:aws:acm:eu-west-2:886403637725:certificate/87c897e0-2e4b-4b88-9d01-cd4e212a0dcb
```
<!-- 
2. Manually logged into console and assigned SSL cert:
https://aws.amazon.com/premiumsupport/knowledge-center/associate-acm-certificate-alb-nlb/

[ todo: maybe we can do this differently and more automated in the future ]
 -->


2. Add the annotations to the kong load balancer:
service.beta.kubernetes.io/aws-load-balancer-backend-protocol: http
service.beta.kubernetes.io/aws-load-balancer-ssl-cert:  arn:aws:acm:eu-west-2:886403637725:certificate/87c897e0-2e4b-4b88-9d01-cd4e212a0dcb
service.beta.kubernetes.io/aws-load-balancer-ssl-ports: https


### nginx-ingress webhook issues:

I think sometimes nginx doesn't always get cleaned up properly by helm...

```bash
kubectl get -A ValidatingWebhookConfiguration

kubectl delete ValidatingWebhookConfiguration/ingress-ingress-nginx-admission  
```