FROM node:latest

ENV PM2_PUBLIC_KEY ""
ENV PM2_SECRET_KEY ""

COPY . /root/ytdpnl
WORKDIR /root/ytdpnl
VOLUME /root/ytdpnl/logs
RUN yarn
EXPOSE 12857/tcp
EXPOSE 12858/tcp
