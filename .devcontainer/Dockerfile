FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update && apt-get install -y uuid-runtime python3-pip python3-venv \
    && python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install pyyaml
ENV PATH="/opt/venv/bin:$PATH"