FROM scratch

ADD ./build/nomad-ui-linux-amd64 /nomad-ui

CMD ["/nomad-ui"]
