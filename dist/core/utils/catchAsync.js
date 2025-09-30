"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchAsync = void 0;
class CatchAsync {
    static wrap(controller) {
        return (req, res, next) => {
            controller(req, res, next).catch(next);
        };
    }
}
exports.CatchAsync = CatchAsync;
//# sourceMappingURL=catchAsync.js.map