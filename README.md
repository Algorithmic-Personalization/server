#Pre-Requisites

This assumes you have docker and docker-compose installed.

# Configuration

- adjust the files `config.dist.yaml` and `docker-compose.dist.yaml` to your needs, remove the `.dist` suffix
- don't forget to setup the mailer in `config.yaml`, if using gmail, use 2-FA with an app password
- setup the virtual hosts defined in `docs`, customizing the domain names (and ports if the defaults are not used)
- enable SSL on the virtual hosts using let's encrypt
- put the correct urls in `config.extension.dist.ts` and remove the `.dist` suffix
- define the users that will be able to create an admin account in `adminsWhitelist.ts`
- generate a private key: `ssh-keygen -t rsa -b 4096 -m PEM -f private.key` (do not set a passphrase)
- set correct manifest permissions for domains in `webpack.config.extension.json` and rebuild
- adjust the ports in Dockerfile if needed

# Installation

## Development

Build the server code: `yarn build:server`

Run the tests:
- one-shot: `yarn test`
- continuously: `yarn tdd`

Starts the docker containers:
- `docker compose up -d`

Start the docker server:
- `yarn dev`


## Production commands

- just run `./start`
