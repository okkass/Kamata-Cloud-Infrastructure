FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# 必要なものをインストール
RUN apt-get update \
    && apt-get install -y \
    build-essential zlib1g-dev libncurses5-dev libncursesw5-dev libgdbm-dev libdb-dev libnss3-dev libssl-dev libreadline-dev libffi-dev \
    libsqlite3-dev wget curl llvm libbz2-dev uuid-dev lzma-dev liblzma-dev xz-utils tk-dev uuid-runtime \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# Python 3.14のインストール
RUN set -eux; \
    cd /tmp; \
    curl -LO https://www.python.org/ftp/python/3.14.2/Python-3.14.2.tgz; \
    echo "213fdd3cf28e89e2d779b6ae444ae8aa Python-3.14.2.tgz" | md5sum -c -; \
    tar -xf Python-3.14.2.tgz; \
    cd Python-3.14.2; \
    ./configure --prefix=/opt/python3.14 --enable-optimizations --with-ensurepip=install; \
    make -j"$(nproc)"; \
    make install; \
    rm -rf /tmp/Python-3.14.2 /tmp/Python-3.14.2.tgz
# PATHを通す
ENV PATH="/opt/python3.14/bin:$PATH"
# GoLangのインストール
RUN set -eux; \
    cd /tmp; \
    curl -LO https://go.dev/dl/go1.25.5.linux-amd64.tar.gz; \
    echo "9e9b755d63b36acf30c12a9a3fc379243714c1c6d3dd72861da637f336ebb35b go1.25.5.linux-amd64.tar.gz" | sha256sum -c -; \
    tar -C /usr/local -xzf go1.25.5.linux-amd64.tar.gz; \
    rm -rf /tmp/go1.25.5.linux-amd64.tar.gz
# GoLangのPATHを通す
ENV PATH="/usr/local/go/bin:$PATH"