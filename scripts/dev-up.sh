export DUID=$(id -u)
export DGID=$(id -g)

export USER=${USER}
export FOLDER=$(basename $(pwd))

mkdir -p .vscode-server
docker compose -f compose-dev.yml up -d --build --no-deps
