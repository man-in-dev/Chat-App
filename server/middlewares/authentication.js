import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(400).json({
                success: false,
                message: "invalid authHeader"
            });

            return;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: "unauthorized access"
            });

            return;
        }

        const decode = jwt.verify(token, process.env.JWT_SECRETE);
        if (decode) {
            req.user = decode.id;
            next()
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error while token authorization"
        });
    }
}