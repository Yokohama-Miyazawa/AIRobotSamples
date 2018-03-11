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
  upperarm: {
    server_uri: "http://asm-server.local:1880/sholder-server",
    init_volume: 50,
    volume_change: 15,
  },
  roomrobo: {
    server_url: "http://asm-server.local:3090",
    init_volume: 100,
  },
  voice_hat: true,
}
