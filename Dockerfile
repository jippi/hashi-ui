FROM scratch

ADD ./backend/nomad-ui-linux /nomad-ui

CMD ["/nomad-ui"]
