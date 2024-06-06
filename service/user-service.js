const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const { activate } = require('../controllers/user-controller')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({email})
        if (candidate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
        }

        if (typeof password !== 'string') {
            throw new Error('Пароль должен быть строкой');
        }

        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()

        const user = await UserModel.create({email, password: hashPassword, activationLink})
       /* await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`) */
        
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(UserDto.id, tokens.refreshToken);
        
        return {...tokens, user: userDto}

    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw new Error('Некорректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }
}

module.exports = new UserService();