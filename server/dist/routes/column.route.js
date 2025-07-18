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
const columnRouter = express_1.default.Router();
// Get all columns for a specific board, including cards
columnRouter.get('/:boardId', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardId = Number(req.params.boardId);
    try {
        const columns = yield prisma_1.default.column.findMany({
            where: {
                boardId,
                board: {
                    userId: req.user.userId,
                },
            },
            include: {
                cards: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        columnId: true,
                        order: true,
                        createdAt: true,
                        updatedAt: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
        res.json(columns);
    }
    catch (err) {
        console.error('Error fetching columns:', err);
        res.status(500).json({ error: 'Failed to fetch columns' });
    }
}));
// Create a new column
columnRouter.post('/', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, boardId, order } = req.body;
    if (!title || !boardId) {
        res.status(400).json({ error: 'Title and boardId are required' });
        return;
    }
    try {
        const column = yield prisma_1.default.column.create({
            data: { title, boardId, order },
        });
        res.status(201).json(column);
    }
    catch (err) {
        console.error('Error creating column:', err);
        res.status(500).json({ error: 'Failed to create column' });
    }
}));
// Delete a column (cards + comments auto-deleted via cascade)
columnRouter.delete('/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const columnId = Number(req.params.id);
    try {
        yield prisma_1.default.column.delete({
            where: { id: columnId },
        });
        res.status(204).send();
    }
    catch (err) {
        console.error('Error deleting column:', err);
        res.status(500).json({ error: 'Failed to delete column' });
    }
}));
// Reorder columns
columnRouter.patch('/reorder', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { columns } = req.body;
    try {
        const updates = yield Promise.all(columns.map(({ id, order }) => prisma_1.default.column.update({ where: { id }, data: { order } })));
        res.json({ message: 'Columns reordered', updated: updates });
    }
    catch (err) {
        console.error('Error reordering columns:', err);
        res.status(500).json({ error: 'Failed to reorder columns' });
    }
}));
// Update column title
columnRouter.put('/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const columnId = Number(req.params.id);
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    try {
        const column = yield prisma_1.default.column.findUnique({
            where: { id: columnId },
            include: { board: true },
        });
        if (!column || column.board.userId !== req.user.userId) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const updated = yield prisma_1.default.column.update({
            where: { id: columnId },
            data: { title },
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Error updating column title:', err);
        res.status(500).json({ error: 'Failed to update column title' });
    }
}));
exports.default = columnRouter;
