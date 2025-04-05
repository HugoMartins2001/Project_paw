require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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

// Configuração do Facebook OAuth
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email'] // Solicita o email e o nome do perfil
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Verifica se o email está disponível
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            return done(null, { facebookId: profile.id, name: profile.displayName });
        }
        // Procura o usuário no banco de dados pelo Facebook ID
        let user = await User.findOne({ facebookId: profile.id });

        // Se o usuário não existir, cria um novo
        if (!user) {
            user = await User.create({
                facebookId: profile.id,
                email: email, // Nem sempre o Facebook retorna o email
                name: profile.displayName // Obtém o nome do perfil
            });
        }

        // Finaliza o processo de autenticação
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;