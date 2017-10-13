# HTTP API

All requests need the same format in the payload: `{"type":"NOMAD_WATCH_NODES"}`

Some requests all take arguments, those belong in JSON field called `payload`: `{"type":"NOMAD_WATCH_NODES", "payload": "something_here"}`

## Example

`curl -i -X POST localhost:3000/api/nomad/$region -d '{"type":"NOMAD_WATCH_NODES"}'`

`curl -i -X POST localhost:3000/api/nomad/$region -d '{"type":"NOMAD_WATCH_JOBS", "payload:" { "prefix": "app-"}}'`

## Nomad

### Jobs

#### List

List all jobs, optionally with a prefix

- `type` `NOMAD_WATCH_JOBS`
- `payload` optional
    - `prefix` optional string

Example: `{"type":"NOMAD_WATCH_JOBS"}` or `{"type":"NOMAD_WATCH_JOBS", "payload:" { "prefix": "app-"}}`

#### Info

Show a single job information

- `type` `NOMAD_WATCH_JOB`
- `payload` required
    - `id` required string (job id)
    - `version` optional string (version number)

Example: `{"type":"NOMAD_WATCH_JOB", "payload": {"id": "demo-app"} }` or `{"type":"NOMAD_WATCH_JOB", "payload:" {"id": "demo-app", "version": "10"} }`

---

All the actions can be found in `backend/nomad/*/.go` - and the required formats can be found the the method `Key()` or `Parse()` for each method.
