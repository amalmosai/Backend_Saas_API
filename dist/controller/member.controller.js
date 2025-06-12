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
const asynHandler_1 = __importDefault(require("../middlewares/asynHandler"));
const member_model_1 = __importDefault(require("../models/member.model"));
const customError_1 = require("../errors/customError");
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const notify_1 = require("../utils/notify");
const DEFAULT_IMAGE_URL = "https://res.cloudinary.com/dnuxudh3t/image/upload/v1748100017/avatar_i30lci.jpg";
class MemberController {
    constructor() {
        this.createMember = (0, asynHandler_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { fname, lname, familyBranch, familyRelationship, gender, husband, wives, } = req.body;
            if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
                req.body.image = req.file.path.replace(/\\/g, "/");
            }
            else {
                req.body.image = DEFAULT_IMAGE_URL;
            }
            if (!fname || !lname || !gender || !familyBranch || !familyRelationship) {
                return next((0, customError_1.createCustomError)("First name, last name, gender, familyRelationship and family branch are required.", customError_1.HttpCode.BAD_REQUEST));
            }
            if (familyRelationship === "زوج") {
                const existingHead = yield member_model_1.default.findOne({
                    familyBranch,
                    familyRelationship: "زوج",
                });
                if (existingHead) {
                    return next((0, customError_1.createCustomError)(`This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`, customError_1.HttpCode.BAD_REQUEST));
                }
                if (gender !== "ذكر") {
                    return next((0, customError_1.createCustomError)("Family head (زوج) must be male", customError_1.HttpCode.BAD_REQUEST));
                }
            }
            if (wives && Array.isArray(wives) && wives.length > 0) {
                const wifeMembers = yield member_model_1.default.find({ _id: { $in: wives } });
                if (wifeMembers.length !== wives.length) {
                    return next((0, customError_1.createCustomError)("One or more wives not found", customError_1.HttpCode.BAD_REQUEST));
                }
                const nonFemales = wifeMembers.filter((w) => w.gender !== "أنثى");
                if (nonFemales.length > 0) {
                    return next((0, customError_1.createCustomError)("All wives must be female", customError_1.HttpCode.BAD_REQUEST));
                }
            }
            if (familyRelationship === "زوجة" && husband) {
                const husbandMember = yield member_model_1.default.findById(husband);
                if (!husbandMember) {
                    return next((0, customError_1.createCustomError)("Husband not found", customError_1.HttpCode.BAD_REQUEST));
                }
                if (husbandMember.gender !== "ذكر") {
                    return next((0, customError_1.createCustomError)("Husband must be male", customError_1.HttpCode.BAD_REQUEST));
                }
                if (husbandMember.familyBranch !== familyBranch) {
                    return next((0, customError_1.createCustomError)("Husband must be from the same family branch", customError_1.HttpCode.BAD_REQUEST));
                }
            }
            const member = yield member_model_1.default.create(req.body);
            yield (0, notify_1.notifyUsersWithPermission)({ entity: "عضو", action: "view", value: true }, {
                sender: { id: req === null || req === void 0 ? void 0 : req.user.id },
                message: "تم إنشاءعضو جديد",
                action: "create",
                entity: { type: "عضو", id: member === null || member === void 0 ? void 0 : member._id },
                metadata: {
                    priority: "medium",
                },
                status: "sent",
                read: false,
                readAt: null,
            });
            res.status(customError_1.HttpCode.CREATED).json({
                success: true,
                message: "Member created successfully",
                data: member,
            });
        }));
        this.updateMember = (0, asynHandler_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const { fname, lname, familyBranch, familyRelationship, gender, husband, wives, } = req.body;
            const member = yield member_model_1.default.findById(id);
            if (!member) {
                return next((0, customError_1.createCustomError)("Member not found", customError_1.HttpCode.NOT_FOUND));
            }
            if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
                req.body.image = req.file.path.replace(/\\/g, "/");
            }
            if (familyRelationship === "زوج" && member.familyRelationship !== "زوج") {
                const existingHead = yield member_model_1.default.findOne({
                    familyBranch,
                    familyRelationship: "زوج",
                    _id: { $ne: member._id },
                });
                if (existingHead) {
                    return next((0, customError_1.createCustomError)(`This family branch already has a male head (${existingHead.fname} ${existingHead.lname})`, customError_1.HttpCode.BAD_REQUEST));
                }
            }
            if (husband) {
                const husbandMember = yield member_model_1.default.findById(husband);
                if (!husbandMember) {
                    return next((0, customError_1.createCustomError)("Husband not found", customError_1.HttpCode.BAD_REQUEST));
                }
            }
            const updatedMember = yield member_model_1.default.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            })
                .populate("userId")
                .populate("husband")
                .populate("wives");
            yield (0, notify_1.notifyUsersWithPermission)({ entity: "عضو", action: "update", value: true }, {
                sender: { id: req === null || req === void 0 ? void 0 : req.user.id },
                message: "تم تعديل عضو",
                action: "update",
                entity: { type: "عضو", id: updatedMember === null || updatedMember === void 0 ? void 0 : updatedMember._id },
                metadata: {
                    priority: "medium",
                },
                status: "sent",
                read: false,
                readAt: null,
            });
            res.status(customError_1.HttpCode.OK).json({
                success: true,
                data: updatedMember,
                message: "Member updated successfully",
            });
        }));
        this.getAllMembers = (0, asynHandler_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const { familyBranch, familyRelationship } = req.query;
            const filter = {};
            if (familyBranch) {
                filter.familyBranch = familyBranch;
            }
            if (familyRelationship) {
                filter.familyRelationship = familyRelationship;
            }
            const totalMembers = yield member_model_1.default.countDocuments(filter);
            const members = yield member_model_1.default.find(filter)
                .populate("userId")
                .populate("husband")
                .populate("wives")
                .skip(skip)
                .limit(limit);
            const totalPages = Math.ceil(totalMembers / limit);
            res.status(customError_1.HttpCode.OK).json({
                success: true,
                data: members,
                pagination: {
                    totalMembers,
                    totalPages,
                    currentPage: page,
                    pageSize: members.length,
                },
                message: "Members retrieved successfully",
            });
        }));
        this.getMemberById = (0, asynHandler_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const member = yield member_model_1.default.findById(id)
                .populate("userId")
                .populate("husband")
                .populate("wives");
            if (!member) {
                return next((0, customError_1.createCustomError)("Member not found", customError_1.HttpCode.NOT_FOUND));
            }
            res.status(customError_1.HttpCode.OK).json({
                success: true,
                data: member,
                message: "Member retrieved successfully",
            });
        }));
        this.deleteMember = (0, asynHandler_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            const member = yield member_model_1.default.findById(id).session(session);
            if (!member) {
                yield session.abortTransaction();
                session.endSession();
                throw (0, customError_1.createCustomError)("Member not found", customError_1.HttpCode.NOT_FOUND);
            }
            if (member.userId) {
                yield user_model_1.default.findByIdAndDelete(member.userId).session(session);
            }
            yield member_model_1.default.findByIdAndDelete(id).session(session);
            yield session.commitTransaction();
            session.endSession();
            yield (0, notify_1.notifyUsersWithPermission)({ entity: "عضو", action: "delete", value: true }, {
                sender: { id: req === null || req === void 0 ? void 0 : req.user.id },
                message: "تم حذف عضو",
                action: "delete",
                entity: { type: "عضو" },
                metadata: {
                    priority: "medium",
                },
                status: "sent",
                read: false,
                readAt: null,
            });
            res.status(customError_1.HttpCode.OK).json({
                success: true,
                message: member.userId
                    ? "Member and user deleted successfully"
                    : "Member deleted successfully",
                data: null,
            });
        }));
    }
}
exports.default = new MemberController();
