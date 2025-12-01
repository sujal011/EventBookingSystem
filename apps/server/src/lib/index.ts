import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(buffer: Buffer): Promise<{type: 'success', url: string} | {type: 'error', error: string}> {
    try {
        return new Promise((resolve) => {
            // Create a readable stream from buffer
            const stream = Readable.from(buffer);
            
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    upload_preset: "event_booking_system",
                    resource_type: "image",
                    // Optimize upload and storage
                    chunk_size: 6000000, // 6MB chunks for faster upload
                    transformation: [
                        {
                            width: 1200,
                            height: 800,
                            crop: "limit", // Don't upscale, only downscale if larger
                            quality: "auto:good", // Automatic quality optimization
                            fetch_format: "auto" // Automatic format selection (WebP for modern browsers)
                        }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        return resolve({
                            type: 'error',
                            error: error.message || "Failed to upload image"
                        });
                    }
                    
                    if (!result) {
                        return resolve({
                            type: 'error',
                            error: "Upload failed - no result returned"
                        });
                    }
                    
                    return resolve({
                        type: "success",
                        url: result.secure_url
                    });
                }
            );
            
            // Pipe the stream to Cloudinary
            stream.pipe(uploadStream);
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return {
            type: 'error',
            error: error instanceof Error ? error.message : "Failed to upload image"
        };
    }
}
