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

Create an apache user to protect the status page:

```bash
sudo htpasswd -c /etc/apache2/.htpasswd <username>
```

or on EC2 probably:

```bash
sudo htpasswd -c /etc/httpd/.htpasswd <username>
```

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

Populate the local database from the remote one:
- rename `scripts.conf.dist` to `scripts.conf` and modify appropriately
- run `./update-db`


## Production things

### Enable backups

- place `backup` inside the home `bin` directory (create it if it doesn't exist)
- add crontab to execute this script every day or whenever you want

The following script can also be useful to save the backup to a remote server via `scp`:

```
#!/bin/env bash
host=some_host
latest_dump_path=$(find "$HOME"/ytdpnl/ytdpnl*.tar -maxdepth 0 -printf "%T@ %p\n" | sort -n | tail -n1 | cut -d' ' -f2)
name=$(basename "$latest_dump_path")
echo "Latest backup found is:"
res=$(find "$latest_dump_path" -printf '%s %AY-%Am-%Ad %AH:%AM %p\n' | numfmt --field=1 --to=iec-i)
echo " -> $res"
target="$host":"~/backups/$name"
echo "Uploading to $target..."
scp "$latest_dump_path" "$target" || exit 1
echo " -> Upload done."
```

### Build / start the server

Stop all containers if running:

```bash
docker-compose down
```

Pull the code:

```bash
git pull
```

If the server is not very big on ram and disk, prune the docker cache:

```bash
docker system prune
```

Build the server code:

```bash
docker-compose build
```

Start the server in the background:

```bash
docker-compose up -d app-server
```

Or preferably in tmux:

```bash
docker-compose up app-server
```
