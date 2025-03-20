import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "src/lib/prisma";
import passport from "passport";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Make sure to check if JWT_SECRET exists
if (!opts.secretOrKey) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

passport.use(
  new JwtStrategy(opts, async (jwt_payload: any, done: any) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: jwt_payload.id,
        },
      });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
