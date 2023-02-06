ARG BINARY=AdServer

ENV SERVER.PORT=3000

FROM golang:1.17-alpine AS builder
WORKDIR /
COPY . .
RUN make install BINARY=${BINARY}

FROM ubuntu:20.04
WORKDIR /root/
COPY --from=builder /go/src/${BINARY}/${BINARY} app
EXPOSE ${SERVER.PORT}
ENTRYPOINT ["./app"]