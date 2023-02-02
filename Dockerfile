# build-env container
FROM golang:1.20.0 AS build-env

ENV CGO_ENABLED=0 GO111MODULE=on GOPROXY=https://proxy.golang.org

RUN apt-get update -q -y && \
    apt-get install -q -y apt-transport-https ca-certificates gnupg && \
    apt-key adv --fetch-keys https://dl.yarnpkg.com/debian/pubkey.gpg && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    # https://github.com/yarnpkg/yarn/issues/6914
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get update -q -y && \
    apt-get install -q -y yarn nodejs

ADD . /go/src/github.com/jippi/hashi-ui
WORKDIR /go/src/github.com/jippi/hashi-ui
RUN make -j rebuild

# application container
FROM alpine

# we need ca-certificates for any external https communication
RUN apk --update upgrade && \
    apk add curl ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/cache/apk/*

COPY --from=build-env /go/src/github.com/jippi/hashi-ui/backend/build/hashi-ui-linux-amd64 /hashi-ui
EXPOSE 3000
CMD ["/hashi-ui"]
