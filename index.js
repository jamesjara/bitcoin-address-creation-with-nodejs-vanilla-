// http://procbits.com/2013/08/27/generating-a-bitcoin-address-with-javascript

const crypto = require('crypto')
const ecurve = require('ecurve')
const BigInteger = require('bigi')
const bs58 = require('bs58')
let ecparams = ecurve.getCurveByName('secp256k1')

let privateKey = crypto.randomBytes(65)
console.log(`PRIVATE KEY ${privateKey.toString('hex')}`)

//
// 1 - Take the corresponding public key generated with it (65 bytes,
// 1 byte 0x04, 32 bytes corresponding to X coordinate, 32 bytes
// corresponding to Y coordinate)
//

const curvePt = ecparams.G.multiply(BigInteger.fromBuffer(privateKey))
const x = curvePt.affineX.toBuffer(32)
const y = curvePt.affineY.toBuffer(32)
const publicKey = Buffer.concat([new Buffer(0x04), x, y])
console.log(`PUBLIC KEY ${publicKey.toString('hex')}`)

// 
// 2 - Perform SHA-256 hashing on the public key
//

const publicKeySHA256 = crypto.createHash('sha256').update(publicKey).digest()
console.log(`SHA-256 ${publicKeySHA256.toString('hex')}`)

//
// 3 - Perform RIPEMD-160 hashing on the result of SHA-256
//

const RIPEMD160 = crypto.createHash('rmd160').update(publicKey).digest()
console.log(`RIPEMD160 ${RIPEMD160.toString('hex')}`)

//
// 4 - Add version byte in front of RIPEMD-160 hash (0x00 for Main Network)
// 

const RIPEMD160Extented = new Buffer.concat([ new Buffer(0x00), RIPEMD160])
console.log(`MAIN ${RIPEMD160Extented.toString('hex')}`)

//
// 5 - Perform SHA-256 hash on the extended RIPEMD-160 result
//

const RIPEMSHA256 = crypto.createHash('sha256').update(RIPEMD160Extented).digest()
console.log(`RIPESHA256 ${RIPEMSHA256.toString('hex')}`)

//
// 6 - Perform SHA-256 hash on the result of the previous SHA-256 hash
// 

const RIPEMSHA2562 = crypto.createHash('sha256').update(RIPEMSHA256).digest()
console.log(`RIPESHA256 ${RIPEMSHA2562.toString('hex')}`)

//
// 7 - Take the first 4 bytes of the second SHA-256 hash. This is the address checksum
//

const checksum = RIPEMSHA2562.slice(0,4)
console.log(`checksum ${checksum.toString('hex')}`)

//
// 8 - Add the 4 checksum bytes from stage 7 at the end of extended 
// RIPEMD-160 hash from stage 4. This is the 25-byte binary Bitcoin Address.
//

const binary25 = new Buffer.concat([ RIPEMD160Extented,  checksum ])
console.log(`binary ${binary25.toString('hex')}`)

//
// 9 - Convert the result from a byte string into a base58 string using Base58Check encoding. This is the most commonly used Bitcoin Address format
//

const bytes = Buffer.from( binary25, 'hex')
const BTCaddress = bs58.encode( bytes )
console.log(`Address ${BTCaddress}`)

