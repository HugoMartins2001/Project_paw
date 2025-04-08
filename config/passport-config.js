require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Serialização do usuário
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Configuração do Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Procura o usuário no banco de dados pelo Google ID
        let user = await User.findOne({ googleId: profile.id });

        // Se o usuário não existir, cria um novo
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value, // Obtém o email do perfil
                name: profile.displayName// Obtém o nome do perfil
            });
        }

        // Finaliza o processo de autenticação
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;