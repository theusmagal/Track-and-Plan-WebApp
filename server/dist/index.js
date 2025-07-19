"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const register_route_1 = __importDefault(require("./routes/register.route"));
const board_route_1 = __importDefault(require("./routes/board.route"));
const column_route_1 = __importDefault(require("./routes/column.route"));
const card_route_1 = __importDefault(require("./routes/card.route"));
const comment_route_1 = __importDefault(require("./routes/comment.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'https://track-and-plan-web-app.vercel.app',
    credentials: true,
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api/auth', register_route_1.default);
app.use('/api/boards', board_route_1.default);
app.use('/api/columns', column_route_1.default);
app.use('/api/cards', card_route_1.default);
app.use('/api/comments', comment_route_1.default);
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
exports.default = app;
