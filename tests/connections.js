var test = require('tape')

var Config = require('../inject')

test('setting custom host:port', t => {
  var config = Config('testnet', {
    host: 'pub.mixmix.io',
    port: 2001
  })

  var { host, port } = config.connections.incoming.net[0]
  t.equal(host, 'pub.mixmix.io', 'net: sets custom host in connections')
  t.equal(port, 2001, 'net: sets custom port in connections')

  t.equal(config.host, 'pub.mixmix.io', 'net: [LEGCACY] custom config.host is set')
  t.equal(config.port, 2001, 'net: [LEGCACY] custom config.port is set')

  var { host: WSHost, port: WSPort } = config.connections.incoming.ws[0]
  t.equal(WSHost, 'pub.mixmix.io', 'ws: sets custom host in connections')
  t.equal(WSPort, 8989, 'ws: sets default port in connections')

  t.equal(config.ws.port, 8989, 'ws: [LEGCACY] custom config.ws.port is set')

  t.end()
})

test('setting custom connections.incoming', t => {
  var config = Config('testnet', {
    connections: {
      incoming: {
        net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }],
        ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
      }
    }
  })

  var { host, port } = config.connections.incoming.net[0]
  t.equal(host, 'pub.mixmix.io', 'net: sets custom host in connections')
  t.equal(port, 23456, 'net: sets custom port in connections')

  t.equal(config.host, 'pub.mixmix.io', 'net: [LEGCACY] custom config.host is set')
  t.equal(config.port, 23456, 'net: [LEGCACY] custom config.port is set')

  var { host: WSHost, port: WSPort } = config.connections.incoming.ws[0]
  t.equal(WSHost, 'pub.mixmix.io', 'ws: sets custom host in connections')
  t.equal(WSPort, 23457, 'ws: sets default port in connections')

  t.equal(config.ws.port, 23457, 'ws: [LEGCACY] custom config.ws.port is set')

  t.end()
})

test('CONFLICTING custom host:port connections.incoming settings', t => {
  var netHost = () => {
    Config('testnet', {
      host: 'peach.party',
      connections: {
        incoming: {
          net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }]
        }
      }
    })
  }

  var netPort = () => {
    Config('testnet', {
      host: 'pub.mixmix.io',
      port: 2019,
      connections: {
        incoming: {
          net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }],
          ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
        }
      }
    })
  }
  var wsPort = () => {
    Config('testnet', {
      ws: { port: 2019 },
      connections: {
        incoming: {
          net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }],
          ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
        }
      }
    })
  }

  function testThrow (fn, target) {
    try {
      fn()
    } catch (e) {
      var expectedMessage = `ssb-config: conflicting connection settings for: ${target}`
      t.equal(e.message, expectedMessage, `catches conflicting ${target} settings`)
    }
  }
  testThrow(netHost, 'net host')
  testThrow(netPort, 'net port')
  testThrow(wsPort, 'ws port')

  // mix: I know t.throws exists, but testing the error message output was annoying

  t.end()
})