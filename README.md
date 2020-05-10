[![Build Status](https://travis-ci.com/chrillen/refactor-app-microservices.svg?branch=master&status=passed)](https://travis-ci.com/github/chrillen/refactor-app-microservices.svg)

# Refactor Udagram App into Microservices and Deploy, Assignment 4 of udacity course.

## The system Consists of 4 applications running NodeJs express.

#### The frontend service is a ionic app that communicate with the reverse proxy that act as a API gateway to route the path to correct microservice.
#### The reverse proxy is just a nginx server acting as a reverse proxy its runned in a docker container only so its not something you run locally.
#### feed api is a nodejs application that is fetching all data from the PostegreSQL database that is runned from AWS RDS Service and is communicating with S3 to get url's to each image.
#### user api is a nodejs application that is handling the authentication and user registration of the services, We generate JWT tokens and store the login information in PostgreSQL database that is hosted in AWS RDS Service.
#### image filter api is a nodejs application is a simple service that takes a image url as input and returns a image blob with the processed image.


### The project is split into three parts:
1. [The Simple Frontend](/udacity-c3-frontend) A basic Ionic client web application which consumes the RestAPI Backend. 
2. [The RestAPI Feed Backend](/udacity-c3-restapi-feed), a Node-Express feed microservice.
3. [The RestAPI User Backend](/udacity-c3-restapi-user), a Node-Express user microservice.
4. [The RestAPI Image filter backend](/udacity-c3-restapi-imagefilter), a Node-Express microservice for adding filter to image.
5. [Nginx as a reverse-proxy server](/udacity-c3-deployment/docker), when different backend services are running on the same port, then a reverse proxy server directs client requests to the appropriate backend server and retrieves resources on behalf of the client.  

### You start each microservice like this:
1. `cd udacity-c3-restapi-user` and `npm install`
2. `cd udacity-c3-restapi-feed` and `npm install`
3. `cd udacity-c3-frontend` and `npm install`


### You start each microservice like this:
1. `cd udacity-c3-frontend` and `ionic serve`
2. `cd udacity-c3-restapi-user` and `npm run dev`
3. `cd udacity-c3-restapi-feed` and `npm run dev`

### Below is setup of travis (/.travis.yml) is the configuration of my CI/CD build.
![image of Travis ci setup](https://github.com/chrillen/refactor-app-microservices/blob/master/images-of-completion/travis-ci.PNG)

## Docker Setup of the projects

# Build, Push and run all docker images using docker-compose.
1. Build the images: `docker-compose -f udacity-c3-deployment/docker/docker-compose-build.yaml build --parallel`
2. Push the images: `docker-compose -f udacity-c3-deployment/docker/docker-compose-build.yaml push`
3. Run the container: first `cd udacity-c3-deployment/docker` then run `docker-compose up`

# Build docker image per project: udacity-c3-restapi-feed
1. start by running `cd udacity-c3-restapi-feed`
2. Build the image: `docker build -t chrillen/udacity-restapi-feed .`
3. Push the image to dockerhub: `docker push chrillen/udacity-restapi-feed`
4. Run the container: `docker run --rm --publish 8080:8080 -v $HOME/.aws:/root/.aws --env POSTGRESS_HOST=$POSTGRESS_HOST --env POSTGRESS_USERNAME=$POSTGRESS_USERNAME --env POSTGRESS_PASSWORD=$POSTGRESS_PASSWORD --env POSTGRESS_DB=$POSTGRESS_DB --env AWS_REGION=$AWS_REGION --env AWS_PROFILE=$AWS_PROFILE --env AWS_BUCKET=$AWS_BUCKET --env JWT_SECRET=$JWT_SECRET --name feed chrillen/udacity-restapi-feed`

# Build docker image per project: udacity-c3-restapi-user
1. start by running `cd udacity-c3-restapi-user`
2. Build the image: `docker build -t chrillen/udacity-restapi-user .`
3. Push the image to dockerhub: `docker push chrillen/udacity-restapi-user`
4. Run the container: `docker run --rm --publish 8080:8080 -v $HOME/.aws:/root/.aws --env POSTGRESS_HOST=$POSTGRESS_HOST --env POSTGRESS_USERNAME=$POSTGRESS_USERNAME --env POSTGRESS_PASSWORD=$POSTGRESS_PASSWORD --env POSTGRESS_DB=$POSTGRESS_DB --env AWS_REGION=$AWS_REGION --env AWS_PROFILE=$AWS_PROFILE --env AWS_BUCKET=$AWS_BUCKET --env JWT_SECRET=$JWT_SECRET --name feed chrillen/udacity-restapi-user`

# Build docker image per project: udacity-c3-frontend
1. start by running `cd udacity-c3-frontend`
2. Build the image: `docker build -t chrillen/udacity-frontend .`
3. Push the image to dockerhub: `docker push chrillen/udacity-frontend`
4. Run the container: `docker run --rm --publish 8080:8080 -v $HOME/.aws:/root/.aws --env POSTGRESS_HOST=$POSTGRESS_HOST --env POSTGRESS_USERNAME=$POSTGRESS_USERNAME --env POSTGRESS_PASSWORD=$POSTGRESS_PASSWORD --env POSTGRESS_DB=$POSTGRESS_DB --env AWS_REGION=$AWS_REGION --env AWS_PROFILE=$AWS_PROFILE --env AWS_BUCKET=$AWS_BUCKET --env JWT_SECRET=$JWT_SECRET --name feed chrillen/udacity-frontend`

# Build docker image per project: reverseproxy
1. start by running `cd udacity-c3-deployment/docker`
2. Build the image: `docker build -t chrillen/reverseproxy .`
3. Push the image to dockerhub: `docker push chrillen/reverseproxy`
4. Run the container: `docker build -t chrillen/reverseproxy . `

![image of dockerhub](https://github.com/chrillen/refactor-app-microservices/blob/master/images-of-completion/docker-hub.PNG)

## Deployment

todo:
Image of get pods cmd screen shoot.
image of travis ci deployments.
image of the application.
image of cloudwatch logs


### For handling rolling update
  1. kubectl rollout restart deployment reverseproxy
  2. kubectl rollout restart deployment backend-feed
  3. kubectl rollout restart deployment backend-user
  4. kubectl rollout restart deployment frontend

### Two versions - 'A' and 'B' of the same application can run simultaneously and serve the traffic

Below is the commands for running all the applications doing A/B deployment of the application.

  1. kubectl create deployment frontend --image=chrillen/udacity-frontend:latest
  2. kubectl scale deployment frontend --current-replicas=1 --replicas=2
  3. kubectl create deployment backend-feed --image=chrillen/udactiy-restapi-feed:latest
  4. kubectl scale deployment backend-feed --current-replicas=1 --replicas=2
  5. kubectl create deployment backend-user --image=chrillen/udactiy-restapi-feed:latest
  6. kubectl scale deployment backend-user --current-replicas=1 --replicas=2
  7. kubectl create deployment reverseproxy --image=chrillen/reverseproxy:latest
  8. kubectl scale deployment reverseproxy --current-replicas=1 --replicas=2