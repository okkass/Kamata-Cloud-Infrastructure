#!/bin/bash

for f in $(find $1 -type f -name '*.ts' ! -name 'index.ts'); do
    name=$(basename "${f%.ts}")
    echo "export type { ${name} } from './${name}';" >> "$1/index.ts"
done