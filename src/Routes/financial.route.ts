import express from "express";
import TransactionController from "../controller/financial.controller";
import { authenticateUser, authorizePermission } from "../middlewares/auth";
import { upload } from "../middlewares/uploadImage";

const router = express.Router();

router
  .route("/")
  .post(
    authenticateUser,
    authorizePermission("financial", "create"),
    upload.single("image"),
    TransactionController.createTransaction
  );

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermission("financial", "view"),
    TransactionController.getAllTransactions
  );

router
  .route("/")
  .delete(
    authenticateUser,
    authorizePermission("financial", "delete"),
    TransactionController.deleteAllTransactions
  );

router
  .route("/:id")
  .get(authenticateUser, TransactionController.getTransactionById);

router
  .route("/:id")
  .delete(
    authenticateUser,
    authorizePermission("financial", "delete"),
    TransactionController.deleteTransactionById
  );

router
  .route("/:id")
  .patch(
    authenticateUser,
    authorizePermission("financial", "update"),
    upload.single("image"),
    TransactionController.updateTransactionById
  );

export default router;
