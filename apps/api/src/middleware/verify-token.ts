import { verify } from 'jsonwebtoken'
import { SECRET } from '../config'

import type { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from 'jsonwebtoken'

export function verifyToken(request: Request, response: Response, next: NextFunction) {

    const authHeader = request.headers.authorization

    if (!authHeader || authHeader.substring(0, 7) !== 'Bearer ') {

        return response.status(401).send({ message: 'Authorization header is missing, or does not have _Bearer _ prefix.' });
    }

    const token = authHeader.split(' ')[1] // Bearer token

    try {
        const decodedToken = verify(token, SECRET) as JwtPayload
        request.headers['x-address'] = decodedToken.address
        next()
    }
    catch (error) {

        return response.status(403).send({ message: 'Invalid access token.' });
    }
}