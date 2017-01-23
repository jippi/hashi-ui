# Nginx Nomad

https://hub.docker.com/r/ygersie/nginx-ldap-lua

We've been running hashi-ui (previously called nomad-ui) quite a lot. As it's currently possible to, besides viewing job statistics,
also edit and manage jobs, the need started to arise to put it behind some form of authentication. Here's where it becomes a bit more
challenging. If you, like we do, run hashi-ui on Nomad itself the service is allocated a dynamic port on a "random" worker. Your average
proxy server can be configured using something like [consul-template](https://github.com/hashicorp/consul-template) but what if you also
want to run your proxy scheduled in a container? You'd like to do backend lookups from Consul.

Nginx Plus (commercial) supports a feature to lookup SRV records in an upstream block but hey, not everyone wants to buy a commercial
license just for this feature. After some searching I came across [this Github project](https://github.com/vlipco/srv-router).
A project that utilizes the Nginx Lua module to do SRV record lookups. I've adjusted the script to remove the service name derived from
alias logic. Instead you can configure a variable in the nginx config `service` which should be set to the FQDN as served by Consul.
The docker container is compiled with the ldap and lua module along with LuaJIT 2.0.

In the example Nomad job you'll find that a Consul **tag** has been configured starting with `urlprefix-`. This is an identifier tag for
[Fabio](https://github.com/eBay/fabio) If you haven't heard of Fabio before please check it out. It's an awesome piece of software which
dynamically creates routes based on Consul services. We use it all over the place to expose external http(s) traffic.

**NOTES:**
* There's no caching mechanism in the Lua script, if you expect high number of requests you might want to setup dnsmasq with caching or
integrate [lua-lrucache](https://github.com/openresty/lua-resty-lrucache)
* Nginx doesn't support a way of listening on a dynamic port. The next Nomad release (0.5.3) will likely contain [a fix](https://github.com/hashicorp/nomad/issues/2217)
to be able to render environment variables in the `template` stanza. At that point we should be able to pass `{{ env "NOMAD_PORT_http" }}`
into the `listen` block to address this issue. I've chosen to run Nginx on static port 15080 since that is a port outside of the Nomad
allocation port range.

# Example Nomad job spec

```hcl
job "hashi-ui" {
    region = "global"
    datacenters = ["dc1"]

    group "web" {
        count = 1

        task "hashiui" {
            driver = "docker"
            config {
                image = "jippi/hashi-ui:v0.13.0"
                network_mode = "host"
            }

            env {
                NOMAD_ADDR = "http://nomad.service.consul:4646"
                CONSUL_ENABLE = 1
                NOMAD_ENABLE = 1
            }

            service {
                name = "${JOB}"
                port = "http"

                check {
                    type = "http"
                    path = "/nomad"
                    interval = "5s"
                    timeout = "2s"
                }
            }

            resources {
                cpu = 500
                memory = 128
                network {
                    mbits = 1
                    port "http" {}
                }
            }
        }

        task "nginx" {
            driver = "docker"
            config {
                image = "ygersie/nginx-ldap-lua:1.11.3"
                network_mode = "host"
                volumes = [
                    "local/config/nginx.conf:/etc/nginx/nginx.conf"
                ]
            }

            template {
                data = <<EOF
worker_processes 2;

events {
  worker_connections 1024;
}

env NS_IP;
env NS_PORT;

http {
  access_log /dev/stdout;
  error_log /dev/stderr;

  auth_ldap_cache_enabled on;
  auth_ldap_cache_expiration_time 300000;
  auth_ldap_cache_size 10000;

  ldap_server ldap_server1 {
    url ldaps://ldap.example.com/ou=People,dc=example,dc=com?uid?sub?(objectClass=inetOrgPerson);
    group_attribute_is_dn on;
    group_attribute member;
    satisfy any;
    require group "cn=secure-group,ou=Group,dc=example,dc=com";
  }

  map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
  }

  server {
    listen 15080;

    location / {
      auth_ldap "Login";
      auth_ldap_servers ldap_server1;

      set $target '';
      set $service "hashi-ui.service.consul";
      set_by_lua_block $ns_ip { return os.getenv("NS_IP") or "127.0.0.1" }
      set_by_lua_block $ns_port { return os.getenv("NS_PORT") or 53 }

      access_by_lua_file /etc/nginx/srv_router.lua;

      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;

      proxy_read_timeout 31d;

      proxy_pass http://$target;
    }
  }
}
EOF
                destination = "local/config/nginx.conf"
                change_mode = "noop"
            }

            service {
                port = "http"

                tags = [
                    "urlprefix-hashi-ui.example.com/"
                ]

                check {
                    type = "tcp"
                    interval = "5s"
                    timeout = "2s"
                }
            }

            resources {
                cpu = 100
                memory = 64
                network {
                    mbits = 1
                    port "http" {
                        static = "15080"
                    }
                }
            }
        }
    }
}
```
