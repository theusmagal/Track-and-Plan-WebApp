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
const boardRouter = express_1.default.Router();
// Get all boards for the logged-in user
boardRouter.get('/', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const boards = yield prisma_1.default.board.findMany({
            where: { userId: req.user.userId },
            include: { columns: true },
        });
        res.json(boards);
    }
    catch (err) {
        console.error('Error fetching boards:', err);
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
}));
// Create a new board
boardRouter.post('/', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    try {
        const board = yield prisma_1.default.board.create({
            data: { title, userId: req.user.userId },
        });
        res.status(201).json(board);
    }
    catch (err) {
        console.error('Error creating board:', err);
        res.status(500).json({ error: 'Failed to create board' });
    }
}));
// Delete a board with manual cascading delete
boardRouter.delete('/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardId = Number(req.params.id);
    try {
        const board = yield prisma_1.default.board.findUnique({ where: { id: boardId } });
        if (!board || board.userId !== req.user.userId) {
            res.status(404).json({ error: 'Board not found or access denied' });
            return;
        }
        // Delete all cards in the columns of this board
        yield prisma_1.default.card.deleteMany({
            where: {
                column: {
                    boardId: boardId,
                },
            },
        });
        // Delete all columns in this board
        yield prisma_1.default.column.deleteMany({
            where: {
                boardId: boardId,
            },
        });
        // Delete the board
        yield prisma_1.default.board.delete({ where: { id: boardId } });
        res.status(204).send();
    }
    catch (err) {
        console.error('Error deleting board:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update a board's title
boardRouter.patch('/:id', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const boardId = Number(req.params.id);
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'Title is required' });
        return;
    }
    try {
        const board = yield prisma_1.default.board.findUnique({ where: { id: boardId } });
        if (!board || board.userId !== req.user.userId) {
            res.status(404).json({ error: 'Board not found or access denied' });
            return;
        }
        const updated = yield prisma_1.default.board.update({
            where: { id: boardId },
            data: { title },
        });
        res.status(200).json(updated);
    }
    catch (err) {
        console.error('Error updating board title:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = boardRouter;
