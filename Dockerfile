FROM node:latest

COPY . /root/ytdpnl
WORKDIR /root/ytdpnl
RUN yarn
EXPOSE 12857/tcp
EXPOSE 12858/tcp
