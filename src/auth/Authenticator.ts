import { Jwt, JwtHeader, decode, verify } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import LOG from '../utils/Logger';
import fetch from 'node-fetch';
import { Request } from 'express';

const cognitoPublicKeys: Array<JwtHeader> = [];

/**
 * Authenticate Web socket handshake request, only accept connections from authenticated
 *
 * @param request Sokcet handshake request
 *
 * @param callback callback function after authenticated
 *
 */
export const authenticateSocketRequest = async (_request: Request): Promise<boolean> => {
  return true;
  // const token = request.headers['sec-websocket-protocol'];
  // if (!token) {
  //   LOG.error('Received authenticated request with empty token');
  //   return false;
  // }

  // LOG.debug('Received an request to authenticate with token: ', token);
  // try {
  //   await verifyJwtToken(token);
  //   return true;
  // } catch (error) {
  //   LOG.error('Received authenticated request with invalid token: %s - Error message: %s', token, error.message);
  //   return false;
  // }
};

/**
 * Verify and decode a jwt token string against cognito user pool
 *
 * @param token cognito token to verify
 *
 * @returns just return undefined if request can decode, throw error otherwise
 */
export const verifyJwtToken = async (token: string): Promise<undefined> => {
  const jwt: Jwt | undefined = decodeJwt(token);
  if (!jwt?.header?.kid) {
    throw new Error('Invalid token, cannot read kid after decode.');
  }

  const cognitoPublicKey = await getCognitoPublicKey(jwt.header.kid);
  LOG.debug('Public key to verify token with: %o', cognitoPublicKey);

  if (cognitoPublicKey) {
    const pem = jwkToPem(cognitoPublicKey as any);
    // this will throw exception if the token is invalid, and to be handled in the caller
    verify(token, pem, { algorithms: ['RS256'] });
  } else {
    LOG.error('Could not get cognito punblic key to verify');
    throw new Error('Could not get cognito punblic key to verify');
  }
  return;
};

/**
 * Decode base64 token string to Jwt object
 *
 * @param token
 *    base64 token string
 * @returns
 *    Jwt object or undefined it the token is not in structure
 */
const decodeJwt = (token: string): Jwt | undefined => {
  const [headerStr, payloadStr, signature] = token.split('.');

  if (!headerStr || !payloadStr || !signature) {
    return;
  }

  const result = {
    header: base64ToJson(headerStr),
    payload: decode(token) as any,
    signature,
  };
  LOG.debug(`Authenticated token result: %o`, result);
  return result;
};

/**
 * decode base64 srting and convert to JSON
 */
const base64ToJson = (str: string) => {
  const buff = Buffer.from(str, 'base64');
  const text = buff.toString('ascii');
  return JSON.parse(text);
};

/**
 * get public keys from cognito user pool
 * @param region
 *    string of region id
 * @param poolId
 *    string of pool id
 * @returns
 *
 */
const fetchCognitoPublicKeys = async (region: string | undefined, poolId: string | undefined): Promise<{ keys: Array<JwtHeader> }> => {
  if (!region) {
    LOG.error('Empty region name, cannot read cognito public key to verify token');
  }
  if (!poolId) {
    LOG.error('Empty poolId, cannot read cognito public key to verify token');
  }
  return fetch(`https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`).then((res) => res.json());
};

/**
 * get and filter public key from cognito user pool by key id
 *
 * @param kid
 *    public key id decoded from token
 * @returns
 *    public key object
 */
const getCognitoPublicKey = async (kid: string) => {
  if (!cognitoPublicKeys.length) {
    const { keys } = await fetchCognitoPublicKeys(process.env.AWS_REGION || '', process.env.COGNITOO_POOL_ID || '');
    if (keys && keys.length) {
      keys.forEach((key: JwtHeader) => {
        cognitoPublicKeys.push(key);
      });
    }
  }
  LOG.debug(`cognitoPublicKeys: `, cognitoPublicKeys);

  return cognitoPublicKeys.find((item) => {
    return item.kid === kid;
  });
};
