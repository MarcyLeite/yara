export DUID=$(id -u)
export DGID=$(id -g)

export USER=${USER}

mkdir -p .vscode-server

docker compose -f compose-dev.yml up -d --build --no-deps