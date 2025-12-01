import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(buffer: Buffer): Promise<{type: 'success', url: string} | {type: 'error', error: string}> {
    try {
        // Convert buffer to base64 data URI
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        
        // Upload using classic method
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            upload_preset: "event_booking_system",
            resource_type: "image"
        });

        return {
            type: "success",
            url: uploadResult.secure_url
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return {
            type: 'error',
            error: error instanceof Error ? error.message : "Failed to upload image"
        };
    }
}
