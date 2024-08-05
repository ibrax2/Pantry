"use client";
import React, { useState, useRef } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import { Camera } from "react-camera-pro";
import Tesseract from 'tesseract.js';  // Import Tesseract.js for OCR
import { OpenAI } from "openai";
import { addItem, getTableItems } from "./table";

// Load environment variables from .env file


const ImageButton = styled(Button)({
  width: "200px",
  height: "200px",
  backgroundImage: `url(camera-icon.png)`,
  backgroundSize: "contain",
  backgroundPosition: "center",
  borderRadius: "20%",
  ":hover": {
    backgroundColor: "#ADD8E6",
    backgroundSize: "103%",
    borderRadius: "20%",
  },
});

const CameraWrapper = styled(Box)({
  width: "600px",
  height: "450px",
  position: "relative",
  margin: "auto",
});

export default function Pic() {
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const camera = useRef(null);
  const isAnalyzing = useRef(false);

  // Accessing the API key from environment variables
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true 
  });

  const handleButtonClick = () => {
    setCameraOpen(true);
  };

  const handleCapture = () => {
    if (camera.current) {
      try {
        const image = camera.current.takePhoto();
        setCapturedImage(image);
        setCameraOpen(false);
        setDialogOpen(true);
        console.log("Captured image:", image);
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    }
  };

  const handleDialogClose = async (confirm) => {
    if (confirm && capturedImage && !isAnalyzing.current) {
      isAnalyzing.current = true;
      await analyzeImage(capturedImage);
      isAnalyzing.current = false;
    } else {
      setCapturedImage(null);
    }
    setDialogOpen(false);
  };

  const handleFlipCamera = () => {
    setIsFrontCamera((prev) => !prev);
  };

  // Function to analyze the image
  const analyzeImage = async (image) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Use Tesseract.js to extract text from the image
      const { data: { text } } = await Tesseract.recognize(
        image,
        'eng', // Language
        { logger: (m) => console.log(m) } // Optional logger
      );

      // Construct the prompt for GPT-4o Mini
      const prompt = `The extracted text from the image is: ${text}. Please analyze it and provide the exact name of the item and its storage location (e.g., 'Dough Pantry' or 'Water Fridge').`;

      // Send the prompt to GPT-4o Mini
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-4o-mini",
      });

      setIsLoading(false);
      setResult(chatCompletion.choices[0].message.content);
      console.log("Chat completion result:", chatCompletion);

      //add item to table
      const [item, location] = chatCompletion.choices[0].message.content.split(" ");

      const handleAddItem = async () => {
        if (item.trim()) {
          await addItem(location, { name: item, count: 1 });
        }
      };

    } catch (error) {
      setIsLoading(false);
      if (error.response?.status === 429) {
        setResult("Too many requests. Please wait a moment and try again.");
      } else if (error.response?.data?.error?.message.includes("quota")) {
        setResult("You have exceeded your quota. Please check your plan and billing details.");
      } else {
        console.error("Error processing image:", error);
        setResult("Failure: Unable to process the image.");
      }
    }
  };

  return (
    <Box>
      <ImageButton onClick={handleButtonClick} />
      {isCameraOpen && (
        <CameraWrapper>
          <Camera
            style={{ width: "100%", height: "100%" }}
            ref={camera}
            facingMode={isFrontCamera ? "user" : "environment"}
            onCapture={handleCapture}
            onClose={() => setCameraOpen(false)}
          />
          <Button
            onClick={handleCapture}
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              backgroundColor: "white",
              borderRadius: "20%",
              padding: "10px",
            }}
          >
            Capture
          </Button>
          <Button
            onClick={handleFlipCamera}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              zIndex: 1000,
              backgroundColor: "white",
              borderRadius: "20%",
              padding: "10px",
            }}
          >
            Flip
          </Button>
          <Button
            onClick={() => setCameraOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1000,
              backgroundColor: "white",
              borderRadius: "20%",
              padding: "10px",
            }}
          >
            Close
          </Button>
        </CameraWrapper>
      )}
      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Photo</DialogTitle>
        <DialogContent>
          <Typography>Continue with this photo?</Typography>
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: "100%", height: "auto", marginTop: "10px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Retake
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {isLoading && (
        <Box display="flex" justifyContent="center" marginTop={2}>
          <CircularProgress />
        </Box>
      )}
      {result && (
        <Typography variant="h6" align="center" marginTop={2}>
          {result}
        </Typography>
      )}
    </Box>
  );
}
