FROM alpine:3.4

RUN apk --no-cache add lighttpd

COPY ./config/lighttpd.conf /lighttpd.conf
COPY ./dist/ /nomad-ui
COPY ./run.sh /nomad-ui/run.sh

WORKDIR /nomad-ui

CMD ["/nomad-ui/run.sh"]
