import mongoose from "mongoose";
import colors from "colors"

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Database Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold);
        process.exit(1); // Exit with a non-zero status code to indicate an error
    }
}

export default connectDb;