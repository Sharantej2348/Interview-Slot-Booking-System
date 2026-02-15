import { registerService, loginService } from "../services/auth.service.js";

import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
    try {
        const user = await registerService(req.body);

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const user = await loginService(req.body);

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMe = async (req, res) => {
    res.json({
        success: true,
        data: req.user,
    });
};
