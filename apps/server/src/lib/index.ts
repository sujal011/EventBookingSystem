import { v2 as cloudinary } from "cloudinary";
import type { File } from "zod/v4/core";

export async function uploadToCloudinary(file: File) : 
    Promise<{type: 'success', url: string | undefined} | {type: 'error', error: string}> {
    try {
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return new Promise((resolve)=>{
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    upload_preset: "event_booking_system",
                    resource_type: "image"
                },
                (err, uploadResult)=>{
                    if(err){
                        console.error("Cloudinary upload error:", err);
                        return resolve({
                            type: 'error',
                            error: err.message || "Failed to upload image"
                        });
                    }
                    return resolve({
                        type: "success",
                        url: uploadResult?.secure_url
                    })
                }
            );
            
            // Write buffer to stream
            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error("Error processing file:", error);
        return {
            type: 'error',
            error: error instanceof Error ? error.message : "Failed to process image file"
        };
    }
}
