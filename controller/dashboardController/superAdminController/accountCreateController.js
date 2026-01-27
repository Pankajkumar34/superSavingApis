
const models = require("../../../models/index");
const { successResponse, failedErrorResponse, errorResponse } = require("../../../helpers/response.helper")
const { generateAccountNumber } = require("../../../utils/accountNumberGenerate");
const { passwordHash } = require("../../../middlewares/auth.middleware");
const mongoose = require("mongoose");
const calcPercent = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number(((current - previous) / previous) * 100).toFixed(2);
};

module.exports = {
  accountCreate: async (req, res) => {
    try {
      const {
        firstName, countryCode, lastName, email, password, role, phoneNumber, branchName, name,
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
        profileImage: "",
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
      const now = new Date();

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Last 7 days
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      // Current month (1st date)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Previous month
      const startOfPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      /* ================= ROLE COUNTS ================= */

      const roleStats = await models.userModel.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]);

      const roleCounts = {
        USER: 0,
        SUPER_ADMIN: 0,
        FRANCHISE_ADMIN: 0,
        WAREHOUSE_ADMIN: 0
      };

      roleStats.forEach(r => {
        roleCounts[r._id] = r.count;
      });

      const totalUsers = Object.values(roleCounts).reduce(
        (a, b) => a + b,
        0
      );

      /* ================= USER GROWTH (ROLE: USER) ================= */

      const [userToday, userWeek, userMonth] = await Promise.all([
        models.userModel.countDocuments({
          role: "USER",
          createdAt: { $gte: startOfDay }
        }),
        models.userModel.countDocuments({
          role: "USER",
          createdAt: { $gte: startOfWeek }
        }),
        models.userModel.countDocuments({
          role: "USER",
          createdAt: { $gte: startOfMonth }
        })
      ]);

      const [prevUserDay, prevUserWeek, prevUserMonth] = await Promise.all([
        models.userModel.countDocuments({
          role: "USER",
          createdAt: {
            $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
            $lt: startOfDay
          }
        }),
        models.userModel.countDocuments({
          role: "USER",
          createdAt: {
            $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lt: startOfWeek
          }
        }),
        models.userModel.countDocuments({
          role: "USER",
          createdAt: {
            $gte: startOfPrevMonth,
            $lt: startOfMonth
          }
        })
      ]);

      /* ================= FRANCHISE GROWTH ================= */

      const [frToday, frWeek, frMonth] = await Promise.all([
        models.userModel.countDocuments({
          role: "FRANCHISE_ADMIN",
          createdAt: { $gte: startOfDay }
        }),
        models.userModel.countDocuments({
          role: "FRANCHISE_ADMIN",
          createdAt: { $gte: startOfWeek }
        }),
        models.userModel.countDocuments({
          role: "FRANCHISE_ADMIN",
          createdAt: { $gte: startOfMonth }
        })
      ]);

      const [prevFrDay, prevFrWeek, prevFrMonth] = await Promise.all([
        models.userModel.countDocuments({
          role: "FRANCHISE_ADMIN",
          createdAt: {
            $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
            $lt: startOfDay
          }
        }),
        models.userModel.countDocuments({
          role: "FRANCHISE_ADMIN",
          createdAt: {
            $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lt: startOfWeek
          }
        }),
        models.userModel.countDocuments({
          role: "FRANCHISE_ADMIN",
          createdAt: {
            $gte: startOfPrevMonth,
            $lt: startOfMonth
          }
        })
      ]);

      /* ================= PERCENTAGE CALC ================= */

      const calcPercent = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number(((current - previous) / previous) * 100).toFixed(2);
      };

      /* ================= FINAL RESPONSE ================= */

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          roleCounts,

          growth: {
            users: {
              today: {
                count: userToday,
                percentage: calcPercent(userToday, prevUserDay)
              },
              week: {
                count: userWeek,
                percentage: calcPercent(userWeek, prevUserWeek)
              },
              month: {
                count: userMonth,
                percentage: calcPercent(userMonth, prevUserMonth)
              }
            },

            franchise: {
              today: {
                count: frToday,
                percentage: calcPercent(frToday, prevFrDay)
              },
              week: {
                count: frWeek,
                percentage: calcPercent(frWeek, prevFrWeek)
              },
              month: {
                count: frMonth,
                percentage: calcPercent(frMonth, prevFrMonth)
              }
            }
          }
        }
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
      const userid = req.query.id
      console.log(userid)
      const accountData = await models.userModel.aggregate(
        [
          {
            $match: {
              _id: new mongoose.Types.ObjectId(userid)
            }
          },
          {
            $lookup: {
              from: "franchises",
              localField: "_id",
              foreignField: "owner",
              as: "data"
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
              "password": 0,
              "isOtpVerified": 0,
              "refreshTokens": 0,
              "isProfileCompleted": 0
            }
          }
        ]
      )

      return res.status(200).json({status:true,accountData})
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  //    getUserStats: async (req, res) => {
  //   try {
  //     const now = new Date();

  //     const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  //     const startOfWeek = new Date();
  //     startOfWeek.setDate(startOfWeek.getDate() - 7);

  //     const startOfMonth = new Date();
  //     startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  //     /* ================= ROLE COUNTS ================= */

  //     const roleStats = await models.userModel.aggregate([
  //       {
  //         $group: {
  //           _id: "$role",
  //           count: { $sum: 1 }
  //         }
  //       }
  //     ]);

  //     const roleCounts = {
  //       USER: 0,
  //       SUPER_ADMIN: 0,
  //       FRANCHISE_ADMIN: 0,
  //       WAREHOUSE_ADMIN: 0
  //     };

  //     roleStats.forEach(r => {
  //       roleCounts[r._id] = r.count;
  //     });

  //     const totalUsers = Object.values(roleCounts).reduce((a, b) => a + b, 0);

  //     /* ================= USER GROWTH (ALL USERS) ================= */

  //     const [userToday, userWeek, userMonth] = await Promise.all([
  //       models.userModel.countDocuments({ createdAt: { $gte: startOfDay } }),
  //       models.userModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
  //       models.userModel.countDocuments({ createdAt: { $gte: startOfMonth } })
  //     ]);

  //     const [prevUserDay, prevUserWeek, prevUserMonth] = await Promise.all([
  //       models.userModel.countDocuments({
  //         createdAt: {
  //           $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
  //           $lt: startOfDay
  //         }
  //       }),
  //       models.userModel.countDocuments({
  //         createdAt: {
  //           $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
  //           $lt: startOfWeek
  //         }
  //       }),
  //       models.userModel.countDocuments({
  //         createdAt: {
  //           $gte: new Date(startOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
  //           $lt: startOfMonth
  //         }
  //       })
  //     ]);

  //     /* ================= FRANCHISE GROWTH ================= */

  //     const [frToday, frWeek, frMonth] = await Promise.all([
  //       models.userModel.countDocuments({
  //         role: "FRANCHISE_ADMIN",
  //         createdAt: { $gte: startOfDay }
  //       }),
  //       models.userModel.countDocuments({
  //         role: "FRANCHISE_ADMIN",
  //         createdAt: { $gte: startOfWeek }
  //       }),
  //       models.userModel.countDocuments({
  //         role: "FRANCHISE_ADMIN",
  //         createdAt: { $gte: startOfMonth }
  //       })
  //     ]);

  //     const [prevFrDay, prevFrWeek, prevFrMonth] = await Promise.all([
  //       models.userModel.countDocuments({
  //         role: "FRANCHISE_ADMIN",
  //         createdAt: {
  //           $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
  //           $lt: startOfDay
  //         }
  //       }),
  //       models.userModel.countDocuments({
  //         role: "FRANCHISE_ADMIN",
  //         createdAt: {
  //           $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
  //           $lt: startOfWeek
  //         }
  //       }),
  //       models.userModel.countDocuments({
  //         role: "FRANCHISE_ADMIN",
  //         createdAt: {
  //           $gte: new Date(startOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
  //           $lt: startOfMonth
  //         }
  //       })
  //     ]);

  //     return res.status(200).json({
  //       success: true,
  //       data: {
  //         totalUsers,
  //         roleCounts,

  //         growth: {
  //           users: {
  //             today: {
  //               count: userToday,
  //               percentage: calcPercent(userToday, prevUserDay)
  //             },
  //             week: {
  //               count: userWeek,
  //               percentage: calcPercent(userWeek, prevUserWeek)
  //             },
  //             month: {
  //               count: userMonth,
  //               percentage: calcPercent(userMonth, prevUserMonth)
  //             }
  //           },

  //           franchise: {
  //             today: {
  //               count: frToday,
  //               percentage: calcPercent(frToday, prevFrDay)
  //             },
  //             week: {
  //               count: frWeek,
  //               percentage: calcPercent(frWeek, prevFrWeek)
  //             },
  //             month: {
  //               count: frMonth,
  //               percentage: calcPercent(frMonth, prevFrMonth)
  //             }
  //           }
  //         }
  //       }
  //     });

  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server error"
  //     });
  //   }
  // }

}