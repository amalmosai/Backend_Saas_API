import express from "express";
import MemberController from "../controller/member.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("member", "create"),
    MemberController.createMember
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("member", "view"),
    MemberController.getAllMembers
  );

router.route("/:id").get(authenticateUser, MemberController.getMemberById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("member", "delete"),
    MemberController.deleteMember
  );

router
  .route("/:id")
  .put(
    authenticateUser,
    authorizePermission("member", "update"),
    MemberController.updateMember
  );

export default router;
