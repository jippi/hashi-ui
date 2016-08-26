FROM scratch

EXPOSE 3000

ADD ./build/nomad-ui-linux-amd64 /nomad-ui

ENTRYPOINT ["/nomad-ui"]
