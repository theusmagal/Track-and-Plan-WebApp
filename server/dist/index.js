"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const register_route_1 = __importDefault(require("./routes/register.route"));
const board_route_1 = __importDefault(require("./routes/board.route"));
const column_route_1 = __importDefault(require("./routes/column.route"));
const card_route_1 = __importDefault(require("./routes/card.route"));
const comment_route_1 = __importDefault(require("./routes/comment.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ✅ CORS configuration allowing Vercel + local dev
const allowedOrigins = [
    'https://track-and-plan-web-app.vercel.app',
    'https://track-and-plan-web-app-2i5x.vercel.app',
    'http://localhost:5173',
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
// ✅ Route handlers
app.use('/api/auth', register_route_1.default);
app.use('/api/boards', board_route_1.default);
app.use('/api/columns', column_route_1.default);
app.use('/api/cards', card_route_1.default);
app.use('/api/comments', comment_route_1.default);
// ✅ Export app to use with Railway deployment
exports.default = app;
