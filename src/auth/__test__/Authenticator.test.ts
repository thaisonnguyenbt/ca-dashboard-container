import { authenticateSocketRequest } from '../Authenticator';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

import fetch from 'node-fetch';
jest.mock('node-fetch');

describe('Authenticator test', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const request: Request = {
    headers: {
      'sec-websocket-protocol': 'eyJraWQiOiJIR21uRm5GMUhtY2JuZjNUais2NkRHajJCcXZ3czJGV0d1VWNsS1B0WGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MGIxYjZlOS1kMTQ4LTQ4MjctYjMyYi03NTgzYTJhYjA2YjQiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJldmVudF9pZCI6ImYwNjVlNDQ4LTcxYWMtNDA4NC05NjExLTIzOGYyZGYwZTNmNiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2Mjg0OTE5NzcsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX1ExT3NTb3M4bCIsImV4cCI6MTYyODQ5NTU3NywiaWF0IjoxNjI4NDkxOTc3LCJqdGkiOiI1ZDhjMzQ2MS00Y2U4LTQ1MjktYTk5Yy1lZmNhZTU5NGVhY2IiLCJjbGllbnRfaWQiOiIxdmZtZjBuZjM5cGU1dHNxNHIwcTRzNjYwbyIsInVzZXJuYW1lIjoiODBiMWI2ZTktZDE0OC00ODI3LWIzMmItNzU4M2EyYWIwNmI0In0.XO-X0h5AJ0c3jat_yw6CdvIhrD6wMjyTFZcFubAyqgG2p5WBGeS_tk8LuYJvx4cpKs8ajF967zcbCUEqZ4QVYWeu1VGGoTPYLbGGsGCuT-bOna3CbKElIrP9XvzIrVVT2hLQw3I39NFMYJV3D7Dj8k7mSa4kqzoWv1bpL7McTy7sLHLAGugGkhYCjqql5kYulpRVlA2ad8gsjI5IfJsUZPpP4yYkCUMiK85GVINrWqJM60YBGPB4ID0UHUgWhnFw8hf6c-G4y-zu8JUGv7hknWlJSxEfrH0oKIrNSt_9itKLI4GadqQPlRCj34l0gcpruST10amKcWwdOSHg9BjOWg',
    },
  } as Request;

  it('should handle empty public key', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      json: jest.fn().mockReturnValue({
        keys: [],
      } as any),
    } as any);

    expect(authenticateSocketRequest(request)).resolves.not.toBeTruthy();
  });

  it('should authenticate request valid request', () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    process.env.AWS_REGION = 'region';
    process.env.COGNITOO_POOL_ID = 'pool_id';
    mockFetch.mockResolvedValue({
      json: jest.fn().mockReturnValue({
        keys: [
          {
            alg: 'RS256',
            e: 'AQAB',
            kid: 'V8qoY0X5luR6CQ9aCqLc8i7i2sOlLo2/ar/fkIJ3GAQ=',
            kty: 'RSA',
            n: 'sYlWlYMkwXGPhOUUhtifFFy1VOPWI1j-g7ndpwKJaKEaL_9Ky58NQTGeEw_FB8bufARs3hSN3KceP8lO_V1bDQYnIKZ2P-NHvO-X1WIq0-7FJQOD4PWPekgKe0iSLFrlU-YuvJpMAKhpPyO2pscJAcCwCWpv9Ms5xkMdgHYT2mjJ0cHcQztaDVkq_xFeg0cm3SKEt7PM9we7spDB8T2PK0xVmcjkEHagQt_bqqWZMry7kNFs8mRseVV4o4Z-XORy77cf86q_FCD0NMm-35zEVWFBCMXzk8cZhZQ5YjgCHZOSvfDxcqw--su_Sq9wZECEjYub0jHdKSlqKyqOKUCQLw',
            use: 'sig',
          },
          {
            alg: 'RS256',
            e: 'AQAB',
            kid: 'HGmnFnF1Hmcbnf3Tj+66DGj2Bqvws2FWGuUclKPtXbA=',
            kty: 'RSA',
            n: 'o1zolPzsoU5TynBN1nS6Yn2Vw5OSZ5IN4KXuidR2PORLXB_BzgBOUEKi2etI0c_e70tBIie4zHkJa6PQqse65T5IJx4SvdDDzDl0wLewXY2FZH-6nkMoo0G2jFvvTjN08NdV6aIJ6cDUtR2C1RRSnkGoe23RXj3pze9geb6jnjGx9ItGY6eyzRIVAmVJlefFJg8Sv4rYEn31REMC5lRse3b4zUqxzsveLgM6dEQrcKeTFZtuuoHFytIBXjlCV_jh3wBB42NQ2aNRQgkLkagG7kO5yruyetC6tzAbi-QHFulgaLSmBl8PZfFiEt5vsf_ZhSEmBrS-SjSU866B9mIzxQ',
            use: 'sig',
          },
        ],
      } as any),
    } as any);

    jest.spyOn(jwt, 'verify').mockImplementation(() => () => ({ verified: 'true' }));

    expect(authenticateSocketRequest(request)).resolves.toBeTruthy();
  });

  it('should use the cached key in subsequent requests', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => () => ({ verified: 'true' }));
    expect(authenticateSocketRequest(request)).resolves.toBeTruthy();
  });

  it('should unauthenticate invalid requests', () => {
    expect(authenticateSocketRequest({ headers: {} } as Request)).resolves.not.toBeTruthy();
    expect(authenticateSocketRequest({ headers: { 'sec-websocket-protocol': '.xxx.xxx' } } as Request)).resolves.not.toBeTruthy();
    expect(authenticateSocketRequest({ headers: { 'sec-websocket-protocol': 'xxx..xxx' } } as Request)).resolves.not.toBeTruthy();
    expect(authenticateSocketRequest({ headers: { 'sec-websocket-protocol': 'xxx.xxx.' } } as Request)).resolves.not.toBeTruthy();
  });
});
