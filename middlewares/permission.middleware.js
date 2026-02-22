const models = require('../models/index');

/**
 * Middleware to check if user has specific permission
 * @param {string} resource - The resource to check (users, products, inventory, orders)
 * @param {string} action - The action to check (read, create, update, delete, updateQuantity, updatePrice, updateStatus)
 */
const checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            
            if (!userId) {
                return res.status(401).json({ 
                    success: false,
                    message: "Unauthorized: User ID not found in token" 
                });
            }

            // Get user permissions from database
            const permissionDoc = await models.permissions.findOne({ userId: userId });

            if (!permissionDoc) {
                return res.status(403).json({ 
                    success: false,
                    message: "Permission denied: No permissions assigned to this user" 
                });
            }

            // Check if the user has the required permission
            const userPermissions = permissionDoc.permissions;
            
            if (!userPermissions || !userPermissions[resource]) {
                return res.status(403).json({ 
                    success: false,
                    message: `Permission denied: Resource '${resource}' not found` 
                });
            }

            // Check specific permission
            const hasPermission = userPermissions[resource][action];

            if (!hasPermission) {
                return res.status(403).json({ 
                    success: false,
                    message: `Permission denied: You don't have '${action}' permission for '${resource}'` 
                });
            }

            // Attach permissions to request for later use
            req.userPermissions = userPermissions;
            req.permissionDoc = permissionDoc;

            next();
        } catch (error) {
            console.error("Permission middleware error:", error);
            return res.status(500).json({ 
                success: false,
                message: "Server error in permission verification" 
            });
        }
    };
};

/**
 * Helper function to get user permissions
 */
const getUserPermissions = async (userId) => {
    try {
        const permissionDoc = await models.permissions.findOne({ userId: userId });
        return permissionDoc ? permissionDoc.permissions : null;
    } catch (error) {
        console.error("Error getting user permissions:", error);
        return null;
    }
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param {Array} permissions - Array of { resource, action } objects
 */
const checkAnyPermission = (permissions) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            
            if (!userId) {
                return res.status(401).json({ 
                    success: false,
                    message: "Unauthorized: User ID not found in token" 
                });
            }

            const permissionDoc = await models.permissions.findOne({ userId: userId });

            if (!permissionDoc) {
                return res.status(403).json({ 
                    success: false,
                    message: "Permission denied: No permissions assigned to this user" 
                });
            }

            const userPermissions = permissionDoc.permissions;
            
            // Check if user has ANY of the specified permissions
            const hasAnyPermission = permissions.some(({ resource, action }) => {
                return userPermissions && 
                       userPermissions[resource] && 
                       userPermissions[resource][action] === true;
            });

            if (!hasAnyPermission) {
                return res.status(403).json({ 
                    success: false,
                    message: "Permission denied: You don't have any of the required permissions" 
                });
            }

            req.userPermissions = userPermissions;
            req.permissionDoc = permissionDoc;

            next();
        } catch (error) {
            console.error("Permission middleware error:", error);
            return res.status(500).json({ 
                success: false,
                message: "Server error in permission verification" 
            });
        }
    };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 * @param {Array} permissions - Array of { resource, action } objects
 */
const checkAllPermissions = (permissions) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.userId;
            
            if (!userId) {
                return res.status(401).json({ 
                    success: false,
                    message: "Unauthorized: User ID not found in token" 
                });
            }

            const permissionDoc = await models.permissions.findOne({ userId: userId });

            if (!permissionDoc) {
                return res.status(403).json({ 
                    success: false,
                    message: "Permission denied: No permissions assigned to this user" 
                });
            }

            const userPermissions = permissionDoc.permissions;
            
            // Check if user has ALL of the specified permissions
            const hasAllPermissions = permissions.every(({ resource, action }) => {
                return userPermissions && 
                       userPermissions[resource] && 
                       userPermissions[resource][action] === true;
            });

            if (!hasAllPermissions) {
                return res.status(403).json({ 
                    success: false,
                    message: "Permission denied: You don't have all the required permissions" 
                });
            }

            req.userPermissions = userPermissions;
            req.permissionDoc = permissionDoc;

            next();
        } catch (error) {
            console.error("Permission middleware error:", error);
            return res.status(500).json({ 
                success: false,
                message: "Server error in permission verification" 
            });
        }
    };
};

module.exports = {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    getUserPermissions
};
