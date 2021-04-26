#docker-compose build
rm -rf ./docker-image
mkdi ./docker-image
docker image save -o ./docker-image/bangumi-explorer-latest.tar bangumi_explorer:latest
zip ./docker-image/bangumi-explorer-latest.tar.zip ./docker-image/bangumi-explorer-latest.tar
