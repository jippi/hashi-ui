FROM alpine:3.4

EXPOSE 3000

ADD ./build/nomad-ui-linux-amd64 /nomad-ui

CMD ["/nomad-ui"]
