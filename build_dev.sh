#! /usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

GIT_COMMIT="$(git describe --tags)"
GIT_DIRTY=""
if [ -n "$(git status --porcelain)" ]; then
    GIT_DIRTY=",+CHANGES"
fi

GO_LDFLAGS="-X main.GitCommit=${GIT_COMMIT}${GIT_DIRTY}"

GOBUILD="$(go env GOOS)"-"$(go env GOARCH)"

BINNAME=hashi-ui-"${GOBUILD}"
BUILDNAME="${DIR}/backend/build/${BINNAME}"

rm -rf ${DIR}/frontend/dist
rm -rf ${DIR}/frontend/build

echo "=> building frontend .."

cd ${DIR}/frontend
yarn install --mutex file
yarn run build

cd ${DIR}/backend

rm -rf ${DIR}/backend/build
find ${DIR}/backend/vendor/* -type d -exec rm -rf {} +
rm ${DIR}/backend/bindata_assetfs.go

echo "=> loading build dependencies ..."
go get -u github.com/golang/dep/cmd/dep
go get -u github.com/jteeuwen/go-bindata/...
go get -u github.com/elazarl/go-bindata-assetfs/...
go get github.com/mitchellh/go-ps

echo "=> dep ensure -vendor-only ..."
dep ensure -vendor-only sync

echo "=> packaging assets ..."
go-bindata-assetfs -prefix ${DIR}/frontend ${DIR}/frontend/build/...

echo "=> building ${BUILDNAME} ..."
CGO_ENABLED=0 go build -o "${BUILDNAME}" -ldflags "${GO_LDFLAGS}"

echo "=> done"
