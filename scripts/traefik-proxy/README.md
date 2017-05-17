# Running using Docker for OSX / Linux

Change `172.16.137.186` to your own local interface (`ifconfig en0` on osx or `ifconfig eth0` on linux)

Need to change the IP in both `config.hcl` and `traefik-proxy.nomad`.

Starting nomad (local on osx/linux):
`nomad agent -server -client -data-dir /tmp/derp -bootstrap-expect=1 -bind 172.16.137.186 -config config.hcl` (Relative to `/scripts/traefik-proxy`)

Starting consul (local on osx/linux):
`consul agent -dev -bind 172.16.137.186 -advertise 172.16.137.186 -client 172.16.137.186`

Adding job:
`nomad run traefik-proxy.nomad`

Navigating to http://172.16.137.186:30000/hashi-ui/ should work
