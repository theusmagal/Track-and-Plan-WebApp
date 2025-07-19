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
const cardRouter = express_1.default.Router();
// Get all cards for a specific column
cardRouter.get('/:columnId', auth_1.authMiddleware, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const columnId = Number(req.params.columnId);
    const cards = yield prisma_1.default.card.findMany({
        where: { columnId },
        orderBy: { order: 'asc' },
    });
    res.json(cards);
})));
// Create a card in a column
cardRouter.post('/', auth_1.authMiddleware, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, columnId, order, color } = req.body;
    if (!title || !columnId) {
        return res.status(400).json({ error: 'Title and columnId are required' });
    }
    const card = yield prisma_1.default.card.create({
        data: {
            title,
            columnId,
            order,
            color,
        },
    });
    res.status(201).json(card);
})));
// Update a card
cardRouter.put('/:id', auth_1.authMiddleware, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cardId = Number(req.params.id);
    const { title, columnId, order, color } = req.body;
    if (!title && !columnId && order === undefined && !color) {
        return res.status(400).json({ error: 'No fields provided to update' });
    }
    const updatedCard = yield prisma_1.default.card.update({
        where: { id: cardId },
        data: Object.assign(Object.assign(Object.assign(Object.assign({}, (title && { title })), (columnId && { columnId })), (order !== undefined && { order })), (color && { color })),
    });
    res.json(updatedCard);
})));
// Reorder multiple cards
cardRouter.patch('/reorder', auth_1.authMiddleware, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cards } = req.body; // expects [{ id, order, columnId }]
    const updates = yield Promise.all(cards.map(({ id, order, columnId }) => prisma_1.default.card.update({
        where: { id },
        data: { order, columnId },
    })));
    res.json({ message: 'Cards reordered', updated: updates });
})));
// Delete a card (comments are deleted automatically via cascade)
cardRouter.delete('/:id', auth_1.authMiddleware, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cardId = Number(req.params.id);
    yield prisma_1.default.card.delete({
        where: { id: cardId },
    });
    res.status(204).send();
})));
exports.default = cardRouter;
