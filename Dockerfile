# FROM ubuntu:18.04
FROM mcr.microsoft.com/playwright:v1.20.0-focal
RUN apt-get update -y && apt-get install -y sudo curl git protobuf-compiler
# RUN curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
# RUN apt-get update -y && apt-get install -y nodejs
RUN npm i -g yarn
RUN yarn global add grpc-tools
WORKDIR /usr/src/app
COPY . .
RUN yarn
RUN npx playwright install-deps
RUN git submodule init && git submodule update
RUN ./scripts/make_protos
RUN yarn build

CMD ["node", "build/src/index.js"]
