#!/usr/bin/env bash

minikube image build -t maze .

kubectl delete -f k8s/
kubectl apply -f k8s/
