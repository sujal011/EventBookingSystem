/**
 * Example: How to use image compression in your event form
 * 
 * This is a reference file showing how to integrate the image compression
 * into your existing event creation/update forms.
 */

import { useState } from "react";
import { compressImage, validateImageFile } from "./image-utils";

export function EventFormExample() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate the file
    const validationError = validateImageFile(file, 5);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setIsCompressing(true);
      
      // Compress the image before setting it
      const compressedFile = await compressImage(file, 1920, 1080, 0.85);
      
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      setImageFile(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      alert("Failed to process image");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", "Event Name");
    formData.append("description", "Event Description");
    formData.append("eventDate", new Date().toISOString());
    formData.append("seatCapacity", "100");
    
    // Add the compressed image
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    // Send to API
    const response = await fetch("http://localhost:3000/api/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={isCompressing}
      />
      {isCompressing && <p>Compressing image...</p>}
      {imageFile && (
        <p>
          Ready to upload: {imageFile.name} (
          {(imageFile.size / 1024 / 1024).toFixed(2)}MB)
        </p>
      )}
      <button type="submit">Create Event</button>
    </form>
  );
}
