"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const registerRouter = express_1.default.Router();
// REGISTER
registerRouter.post('/register', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, auth_1.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
})));
// LOGIN
registerRouter.post('/login', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValid = yield bcrypt_1.default.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, auth_1.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
})));
// PROTECTED TEST ROUTE
registerRouter.get('/me', auth_1.authMiddleware, ((req, res) => {
    var _a;
    res.status(200).json({
        message: 'You are authenticated ✅',
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
    });
}));
exports.default = registerRouter;
