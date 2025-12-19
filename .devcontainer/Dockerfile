FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# 必要なものをインストール
RUN apt-get update \
    && apt-get install build-essential zlib1g-dev libncurses5-dev libncursesw5-dev libgdbm-dev libdb-dev libnss3-dev libssl-dev libreadline-dev libffi-dev \
    libsqlite3-dev wget curl llvm libbz2-dev uuid-dev lzma-dev liblzma-dev xz-utils tk-dev uuid-runtime -y
# Python 3.14のインストール
RUN set -eux; \
    cd /tmp; \
    curl -LO https://www.python.org/ftp/python/3.14.2/Python-3.14.2.tgz; \
    tar -xf Python-3.14.2.tgz; \
    cd Python-3.14.2; \
    ./configure --prefix=/opt/venv-python3.14 --enable-optimizations --with-ensurepip=install; \
    make -j"$(nproc)"; \
    make install; \
    rm -rf /tmp/Python-3.14.2 /tmp/Python-3.14.2.tgz
# PATHを通す
ENV PATH="/opt/venv-python3.14/bin:$PATH"