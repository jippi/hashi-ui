FROM scratch

EXPOSE 3000

ADD ./backend/build/hashi-ui-linux-amd64 /hashi-ui

ENTRYPOINT ["/hashi-ui"]
