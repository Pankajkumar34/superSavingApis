
const models = require("../../../models/index");
const { successResponse, failedErrorResponse, errorResponse } = require("../../../helpers/response.helper")
const { generateAccountNumber } = require("../../../utils/accountNumberGenerate");
const { passwordHash } = require("../../../middlewares/auth.middleware");
const mongoose = require("mongoose");
const { getRoleBaseFilter } = require("../../../service/roleFilter");
const { getUserStatsService } = require("../../../service/userStats.service");
const calcPercent = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous) * 100).toFixed(2);
};

module.exports = {
  accountCreate: async (req, res) => {
    try {
      const {
        firstName, countryCode, profileImage, lastName, email, password, role, phoneNumber, branchName, name,
        aadhaarNumber, aadhaarFront, aadhaarBack, panNumber, panImage, passportPhoto, accountHolderName, bankAccountNumber, ifscCode, bankName

      } = req.body;
      const existingUser = await models.userModel.findOne({ email: email });
      if (existingUser) {
        return failedErrorResponse(res, "Email already in use", 400);
      }
      const hashedPassword = await passwordHash(password);
      const accountNumber = generateAccountNumber();
      const newUser = await models.userModel.create({
        firstName: firstName,
        lastName: lastName,
        email,
        password: hashedPassword,
        countryCode: countryCode,
        profileImage: profileImage,
        phoneNumber: phoneNumber,
        accountNumber: accountNumber,
        role
      });
      const doc = {
        aadhaar: {
          number: aadhaarNumber, // encrypted
          frontImage: aadhaarFront, // S3 / Cloudinary URL
          backImage: aadhaarBack,

        },
        pan: {
          number: panNumber, // encrypted
          image: panImage,
        },
        passportPhoto: passportPhoto
      }

      const bankDtls = {
        accountHolderName: accountHolderName,
        accountNumber: bankAccountNumber, // encrypted
        ifscCode: ifscCode,
        bankName: bankName,
        branchName: branchName,
      }
      let newAccount;
      if (newUser && role === "FRANCHISE_ADMIN") {

        newAccount = await models.franchise.create({
          name: name.trim(),
          owner: newUser._id,
          code: accountNumber,
          documents: doc,
          bankDetails: bankDtls
        })
      }
      if (newUser && role === "WAREHOUSE_ADMIN") {
        newAccount = await models.warehouse.create({
          name: name.trim(),
          manager: newUser._id,
          code: accountNumber,
          documents: doc,
          bankDetails: bankDtls
        })
      }
      return successResponse(res, "User created successfully", { newUser, newAccount }, 201);
    } catch (error) {
      return errorResponse(res, "Server error", 500, error);

    }
  },
  getUserStats: async (req, res) => {
    try {
  const baseFilter = getRoleBaseFilter(req.user);
    const data = await getUserStatsService(baseFilter,req.user.role);
      return res.status(200).json({
        success: true,
        data
      
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },
  getAccountDataById: async (req, res) => {
    try {
      const { id, role } = req.query
      const accountData = await models.userModel.aggregate(
        [
          {
            $match: {
              _id: new mongoose.Types.ObjectId(id),
            }
          },
          {
            $lookup: {
              from: "franchises",
              localField: "_id",
              foreignField: "owner",
              as: "franchiseData"
            }
          },

          {
            $lookup: {
              from: "warehouses",
              localField: "_id",
              foreignField: "manager",
              as: "warehouseData"
            }
          },

          {
            $addFields: {
              data: {
                $cond: {
                  if: { $eq: ["$role", "FRANCHISE_ADMIN"] },
                  then: "$franchiseData",
                  else: "$warehouseData"
                }
              }
            }
          },

          {
            $unwind: {
              path: "$data",
              preserveNullAndEmptyArrays: true
            }
          },

          {
            $project: {
              password: 0,
              isOtpVerified: 0,
              refreshTokens: 0,
              isProfileCompleted: 0,
              franchiseData: 0,
              warehouseData: 0
            }
          }
        ]
      )

      return res.status(200).json({ status: true, accountData })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  getUserList: async (req, res) => {
    try {
      const { role } = req.query
      console.log(role,)
      const userList = await models.userModel.aggregate([
        {
          $match: { role: role }
        },
        {
          $lookup: {
            from: "franchises",
            localField: "_id",
            foreignField: "owner",
            as: "franchises"
          }
        },
        {
          $lookup: {
            from: "warehouse",
            localField: "_id",
            foreignField: "manager",
            as: "warehouse"
          }
        },
        {
          $addFields: {
            name: {
              $concat: ["$firstName", " ", "$lastName"]
            }
          }
        },
        {
          $project: {
            refreshTokens: 0,
            walletId: 0
          }
        }
      ]);
      return res.status(200).json({ status: true, userList })

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },
  permissionCreateAndUpdate: async (req, res) => {
    try {
      const { userId, role, permissions } = req.body;

      if (!userId || !role) {
        return res.status(400).json({
          success: false,
          message: "userId and role are required"
        });
      }

      const permissionDoc = await models.permissions.findOneAndUpdate(
        { userId },
        {
          role,
          permissions
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );

      return res.status(200).json({
        success: true,
        message: "Permissions saved successfully",
        data: permissionDoc
      });

    } catch (error) {
      console.error(error, "=====");

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Permissions already exist for this user"
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },
  getPermission: async (req, res) => {
    try {
      const { id } = req.query
      const permissionData = await models.permissions.findOne({ userId: new mongoose.Types.ObjectId(id) })
      return res.status(200).json({ status: true, permissionData })

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

}