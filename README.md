# Streamex

Stream folder with files through WAN using HTTP

#### Configuration
To make sure that host server will run correctly you have to provide three environment variables in `.env` file

`PORT` - Port on which host server is going to listen for HTTP connections

`SECRET` - Secret that has to be provided by consumer in `x-secret` header in order to be authorized from host server

`SOURCE` - Host source directory path from which files are going to be streamed to consumer