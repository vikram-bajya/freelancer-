"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var workspace, hashedPassword, user, client, project, timelineData, _i, timelineData_1, event_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Seeding database...");
                    return [4 /*yield*/, prisma.workspace.upsert({
                            where: { slug: "demo-agency" },
                            update: {},
                            create: {
                                name: "Demo Agency",
                                slug: "demo-agency",
                                brandColor: "#6366f1",
                                logo: null,
                            },
                        })
                        // Create a demo user (freelancer)
                    ];
                case 1:
                    workspace = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("password123", 12)];
                case 2:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: "admin@demo.com" },
                            update: {},
                            create: {
                                name: "Alex Freeman",
                                email: "admin@demo.com",
                                password: hashedPassword,
                                role: "OWNER",
                                workspaceId: workspace.id,
                            },
                        })
                        // Create a demo client
                    ];
                case 3:
                    user = _a.sent();
                    return [4 /*yield*/, prisma.client.upsert({
                            where: { email_workspaceId: { email: "client@example.com", workspaceId: workspace.id } },
                            update: {},
                            create: {
                                name: "Sarah Johnson",
                                email: "client@example.com",
                                workspaceId: workspace.id,
                            },
                        })
                        // Create a demo project
                    ];
                case 4:
                    client = _a.sent();
                    return [4 /*yield*/, prisma.project.upsert({
                            where: { id: "demo-project-1" },
                            update: {},
                            create: {
                                id: "demo-project-1",
                                title: "E-commerce Website Redesign",
                                description: "Full redesign of the company website with new branding and improved UX.",
                                status: "ACTIVE",
                                dueDate: new Date("2026-05-01"),
                                workspaceId: workspace.id,
                                clientId: client.id,
                            },
                        })
                        // Create timeline events
                    ];
                case 5:
                    project = _a.sent();
                    timelineData = [
                        { title: "Project Kickoff", date: new Date("2026-03-01"), completed: true },
                        { title: "Wireframes & Design", date: new Date("2026-03-15"), completed: true },
                        { title: "Development Phase 1", date: new Date("2026-04-01"), completed: false },
                        { title: "Client Review", date: new Date("2026-04-15"), completed: false },
                        { title: "Launch", date: new Date("2026-05-01"), completed: false },
                    ];
                    _i = 0, timelineData_1 = timelineData;
                    _a.label = 6;
                case 6:
                    if (!(_i < timelineData_1.length)) return [3 /*break*/, 9];
                    event_1 = timelineData_1[_i];
                    return [4 /*yield*/, prisma.timelineEvent.create({
                            data: __assign(__assign({}, event_1), { projectId: project.id }),
                        })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: 
                // Create approval items
                return [4 /*yield*/, prisma.approvalItem.createMany({
                        data: [
                            {
                                projectId: project.id,
                                title: "Homepage Design Mockup",
                                description: "Initial homepage design with new color scheme and layout.",
                                status: "APPROVED",
                            },
                            {
                                projectId: project.id,
                                title: "Product Page Template",
                                description: "Template design for all product listing pages.",
                                status: "PENDING",
                            },
                            {
                                projectId: project.id,
                                title: "Mobile Navigation",
                                description: "Mobile responsive navigation and hamburger menu design.",
                                status: "REVISION",
                                clientNote: "Please make the hamburger menu larger and easier to tap.",
                            },
                        ],
                        skipDuplicates: true,
                    })
                    // Create a draft invoice
                ];
                case 10:
                    // Create approval items
                    _a.sent();
                    // Create a draft invoice
                    return [4 /*yield*/, prisma.invoice.create({
                            data: {
                                workspaceId: workspace.id,
                                projectId: project.id,
                                amount: 2500,
                                currency: "USD",
                                status: "SENT",
                                dueDate: new Date("2026-04-10"),
                                notes: "50% deposit for website redesign project.",
                            },
                        })];
                case 11:
                    // Create a draft invoice
                    _a.sent();
                    console.log("✅ Seed complete!");
                    console.log("\uD83D\uDCE7 Login: admin@demo.com | Password: password123");
                    console.log("\uD83C\uDFE2 Workspace slug: demo-agency");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
