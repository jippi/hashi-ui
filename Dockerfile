FROM alpine

# we need ca-certificates for any external https communication
RUN apk --update upgrade && \
    apk add curl ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/cache/apk/*

ADD ./backend/build/hashi-ui-linux-amd64 /hashi-ui
# Use a custom entrypoint
COPY vault-entrypoint.sh /vault-entrypoint.sh
EXPOSE 3000

#ENTRYPOINT ["/hashi-ui"]
# Override the default entrypoint to support a mounted file 
ENTRYPOINT ["/vault-entrypoint.sh"]
