const models = require("../models");

const calcPercent = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous) * 100).toFixed(2);
};

const getDateRanges = () => {
    const now = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfPrevMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    );

    return {
        startOfDay,
        startOfWeek,
        startOfMonth,
        startOfPrevMonth
    };
};
const getUserStatsService = async (baseFilter, userRole) => {

    const {
        startOfDay,
        startOfWeek,
        startOfMonth,
        startOfPrevMonth
    } = getDateRanges();

    /* ================= ROLE COUNTS ================= */

    const roleStats = await models.userModel.aggregate([
        { $match: baseFilter },
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ]);

    const roleCountsRaw = {};

    roleStats.forEach(r => {
        roleCountsRaw[r._id] = r.count;
    });

    /* ================= VISIBLE ROLES ================= */

    const getVisibleRoles = (role) => {
        switch (role) {
            case "SUPER_ADMIN":
                return ["SUPER_ADMIN", "FRANCHISE_ADMIN", "WAREHOUSE_ADMIN", "USER"];
            case "FRANCHISE_ADMIN":
                return ["WAREHOUSE_ADMIN", "USER"];
            case "WAREHOUSE_ADMIN":
                return ["FRANCHISE_ADMIN"];
            default:
                return ["USER"];
        }
    };

    const visibleRoles = getVisibleRoles(userRole);
    const roleCounts = {};

    visibleRoles.forEach(role => {
        if (roleCountsRaw[role] !== undefined) {
            roleCounts[role] = roleCountsRaw[role];
        }
    });
    console.log("Role counts in service:", roleCounts);

    const totalUsers = Object.values(roleCounts)
        .reduce((a, b) => a + b, 0);

    /* ================= USER GROWTH (ROLE: USER) ================= */


    let userToday = 0, userWeek = 0, userMonth = 0;
    let prevUserDay = 0, prevUserWeek = 0, prevUserMonth = 0;

    let frToday = 0, frWeek = 0, frMonth = 0;
    let prevFrDay = 0, prevFrWeek = 0, prevFrMonth = 0;

    // ================= USER GROWTH =================

    if (visibleRoles.includes("USER")) {

        [
            userToday,
            userWeek,
            userMonth,
            prevUserDay,
            prevUserWeek,
            prevUserMonth
        ] = await Promise.all([

            models.userModel.countDocuments({
                ...baseFilter,
                role: "USER",
                createdAt: { $gte: startOfDay }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "USER",
                createdAt: { $gte: startOfWeek }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "USER",
                createdAt: { $gte: startOfMonth }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "USER",
                createdAt: {
                    $gte: new Date(startOfDay.getTime() - 86400000),
                    $lt: startOfDay
                }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "USER",
                createdAt: {
                    $gte: new Date(startOfWeek.getTime() - 7 * 86400000),
                    $lt: startOfWeek
                }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "USER",
                createdAt: {
                    $gte: startOfPrevMonth,
                    $lt: startOfMonth
                }
            })

        ]);
    }

    // ================= FRANCHISE GROWTH =================

    if (visibleRoles.includes("FRANCHISE_ADMIN")) {

        [
            frToday,
            frWeek,
            frMonth,
            prevFrDay,
            prevFrWeek,
            prevFrMonth
        ] = await Promise.all([

            models.userModel.countDocuments({
                ...baseFilter,
                role: "FRANCHISE_ADMIN",
                createdAt: { $gte: startOfDay }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "FRANCHISE_ADMIN",
                createdAt: { $gte: startOfWeek }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "FRANCHISE_ADMIN",
                createdAt: { $gte: startOfMonth }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "FRANCHISE_ADMIN",
                createdAt: {
                    $gte: new Date(startOfDay.getTime() - 86400000),
                    $lt: startOfDay
                }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "FRANCHISE_ADMIN",
                createdAt: {
                    $gte: new Date(startOfWeek.getTime() - 7 * 86400000),
                    $lt: startOfWeek
                }
            }),

            models.userModel.countDocuments({
                ...baseFilter,
                role: "FRANCHISE_ADMIN",
                createdAt: {
                    $gte: startOfPrevMonth,
                    $lt: startOfMonth
                }
            })

        ]);
    }

    // ================= PERCENT CALC =================

    const calcPercent = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number(((current - previous) / previous) * 100).toFixed(2);
    };

    // ================= RETURN =================

    return {
        totalUsers,
        roleCounts,
        growth: {
            users: visibleRoles.includes("USER") ? {
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
            } : undefined,

            franchise: visibleRoles.includes("FRANCHISE_ADMIN") ? {
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
            } : undefined
        }
    };
};

// const getUserStatsService = async (baseFilter) => {

//   const {
//     startOfDay,
//     startOfWeek,
//     startOfMonth,
//     startOfPrevMonth
//   } = getDateRanges();

//   /* ROLE COUNTS */

//   const roleStats = await models.userModel.aggregate([
//     { $match: baseFilter },
//     {
//       $group: {
//         _id: "$role",
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   const roleCounts = {
//     USER: 0,
//     SUPER_ADMIN: 0,
//     FRANCHISE_ADMIN: 0,
//     WAREHOUSE_ADMIN: 0
//   };

//   roleStats.forEach(r => {
//     roleCounts[r._id] = r.count;
//   });

//   const totalUsers = Object.values(roleCounts).reduce((a, b) => a + b, 0);

//   const buildFilter = (role, extra) => ({
//     ...baseFilter,
//     role,
//     ...extra
//   });

//   const [userToday, prevUserDay] = await Promise.all([
//     models.userModel.countDocuments(
//       buildFilter("USER", { createdAt: { $gte: startOfDay } })
//     ),
//     models.userModel.countDocuments(
//       buildFilter("USER", {
//         createdAt: {
//           $gte: new Date(startOfDay.getTime() - 86400000),
//           $lt: startOfDay
//         }
//       })
//     )
//   ]);

//   return {
//     totalUsers,
//     roleCounts,
//     growth: {
//       users: {
//         today: {
//           count: userToday,
//           percentage: calcPercent(userToday, prevUserDay)
//         }
//       }
//     }
//   };
// };

module.exports = { getUserStatsService };