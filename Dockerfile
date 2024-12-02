FROM oven/bun:1

WORKDIR /usr/src/app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

USER bun
ENTRYPOINT [ "bun", "run", "start" ]