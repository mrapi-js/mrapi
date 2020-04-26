import { sign, verify } from 'jsonwebtoken'
import { AuthConfig } from './types'

const defaultConfig: AuthConfig = {
  accessTokenName: 'access-token',
  accessTokenSecret: 'wesjcywhcs',
  accessTokenExpiresIn: '15min',
  refreshTokenName: 'refresh-token',
  refreshTokenSecret: 'wesjcywhcs',
  refreshTokenExpiresIn: '7d',
}

export class Auth {
  constructor(public config = defaultConfig) {}

  createTokens(user: any) {
    const refreshToken = sign(
      { id: user.id, times: user.times },
      this.config.refreshTokenSecret,
      {
        expiresIn: this.config.refreshTokenExpiresIn,
      },
    )
    const accessToken = sign(
      { id: user.id, role: user.role },
      this.config.accessTokenSecret,
      {
        expiresIn: this.config.accessTokenExpiresIn,
      },
    )

    return { refreshToken, accessToken }
  }

  verifyAccessToken(token: any) {
    try {
      const data = verify(token, this.config.accessTokenSecret) as any
      return data
    } catch {
      return null
    }
  }

  verifyRefreshToken(token: any) {
    try {
      const data = verify(token, this.config.refreshTokenSecret) as any
      return data
    } catch {
      return null
    }
  }
}
