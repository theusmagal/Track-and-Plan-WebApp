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
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const commentRouter = express_1.default.Router();
// Get all comments for a card
commentRouter.get('/:cardId', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cardId = Number(req.params.cardId);
    const comments = yield prisma_1.default.comment.findMany({
        where: { cardId },
        orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
}));
// Add new comment
commentRouter.post('/', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardId, text } = req.body;
    const comment = yield prisma_1.default.comment.create({
        data: { cardId, text },
    });
    res.status(201).json(comment);
}));
// Update comment
commentRouter.put('/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const { text } = req.body;
    const updated = yield prisma_1.default.comment.update({
        where: { id },
        data: { text },
    });
    res.json(updated);
}));
// Delete comment
commentRouter.delete('/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    yield prisma_1.default.comment.delete({ where: { id } });
    res.status(204).send();
}));
exports.default = commentRouter;
