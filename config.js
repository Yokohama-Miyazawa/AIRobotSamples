module.exports = {
  tcp: {
    host: 'localhost',
    port: 3090,
  },
  udp: {
    host: 'localhost',
    port: 3090,
  },
  docomo: {
    api_key: process.env.DOCOMO_API_KEY || '',
  },
  mqtt: {
    targetId: 'AIRobot000',
    clientId: 'AIRobot000',
  },
  sholder: {
    server_uri: "http://marisa.local:1880/sholder-server",
    init_volume: 50,
    volume_change: 15,
  },
  voice_hat: true,
}
