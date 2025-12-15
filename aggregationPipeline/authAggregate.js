const mongoose = require("mongoose");

module.exports = {
    getProfilePipeline: (userId) => {
        return [
            {
                $match: { _id: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "wallets",
                    localField: "_id",
                    foreignField: "userId",
                    as: "wallet"
                }
            },
            {
                $unwind: {
                    path: "$wallet",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "wallettransactions",
                    let: { walletId: "$wallet._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$walletId", "$$walletId"] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCredit: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$type", "CREDIT"] },
                                            "$amount",
                                            0
                                        ]
                                    }
                                },
                                totalDebit: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$type", "DEBIT"] },
                                            "$amount",
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    as: "walletStats"
                }
            },

            {
                $addFields: {
                    totalSaved: {
                        $ifNull: [{ $arrayElemAt: ["$walletStats.totalCredit", 0] }, 0]
                    },
                    totalWithdrawn: {
                        $ifNull: [{ $arrayElemAt: ["$walletStats.totalDebit", 0] }, 0]
                    }
                }
            },
            {
                $project: {
                    refreshTokens: 0,
                    otp: 0,
                    otpExpiry: 0
                }
            }

        ]
    }
}