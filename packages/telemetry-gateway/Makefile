IMAGE:=gcr.io/actioman/telemetry-gateway:0.0.4
SA:="actioman-telemetry-collector@actioman.iam.gserviceaccount.com"

.PHONY: all
all:

.PHONY: gcloud-build
gcloud-build:
	gcloud builds submit . --tag ${IMAGE}

.PHONY: gcloud-deploy
gcloud-deploy:
	gcloud run deploy telemetry-gateway --image ${IMAGE} --service-account ${SA} --allow-unauthenticated --region us-west1

.PHONY: gcloud-describe
gcloud-describe:
	gcloud run services describe telemetry-gateway --region us-west1

.PHONY: gcloud-grant
gcloud-grant:
	gcloud projects add-iam-policy-binding actioman \
		--member="serviceAccount:${SA}" \
		--role="roles/monitoring.metricWriter"

