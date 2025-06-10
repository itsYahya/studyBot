#! /usr/bin/env bash

apt update && apt install curl -y

./install.sh

echo "#! /usr/bin/env bash" > mistral.sh
echo "
    until curl http://localhost:11434; do
        echo "waiting for ollama serve to start..."
        sleep 5
    done

    ollama run mistral
" >> mistral.sh

chmod +x mistral.sh
nohup ./mistral.sh > ollama.log 2>&1 &

ollama serve 
