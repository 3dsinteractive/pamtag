build:
	docker build -f ./dockerfiles/dockerfile-script -t 3dsinteractive/pam4-tracker:1.6 . && \
	docker push 3dsinteractive/pam4-tracker:1.6
