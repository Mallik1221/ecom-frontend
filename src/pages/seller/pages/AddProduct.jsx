import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Button } from '@mui/material';
import Popup from '../../../components/Popup';
import { BlueButton } from '../../../utils/buttonStyles';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userHandle';
import altImage from "../../../assets/altimg.png";
import styled from 'styled-components';
import axios from 'axios';

const AddProduct = () => {
  const dispatch = useDispatch();
  const { currentUser, status, response, error } = useSelector(state => state.user);

  const [productName, setProductName] = useState("");
  const [mrp, setMrp] = useState("");
  const [cost, setCost] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [productImage, setProductImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const seller = currentUser._id;

  const [loader, setLoader] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setUploadError("Please select an image file");
        return;
      }
      setSelectedFile(file);
      setUploadError("");
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select an image file");
      return;
    }

    try {
      setLoader(true);
      const baseURL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_PROD_BACKEND_URL
        : process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

      console.log('Uploading to:', baseURL);

      let response;
      
      if (process.env.NODE_ENV === 'production') {
        // Convert image to Base64 for production
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
        reader.readAsDataURL(selectedFile);
        
        const base64Image = await base64Promise;
        
        response = await axios.post(`${baseURL}/upload`, {
          image: base64Image
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Handle file upload for development
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        response = await axios.post(`${baseURL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setProductImage(response.data.imageUrl);
      setUploadError("");
      setMessage("Image uploaded successfully!");
      setShowPopup(true);
    } catch (error) {
      console.error('Upload error details:', {
        error: error,
        response: error.response,
        message: error.message
      });
      setUploadError("Failed to upload image. " + (error.response?.data?.message || error.message || "Please try again."));
    } finally {
      setLoader(false);
    }
  };

  const fields = {
    productName,
    price: {
      mrp: mrp,
      cost: cost,
      discountPercent: discountPercent,
    },
    subcategory,
    productImage,
    category,
    description,
    tagline,
    seller
  };

  const submitHandler = (event) => {
    event.preventDefault();
    if (!productImage) {
      setUploadError("Please upload a product image");
      return;
    }
    setLoader(true);
    dispatch(addStuff("ProductCreate", fields));
  };

  useEffect(() => {
    if (status === "added") {
      setLoader(false);
      setShowPopup(true);
      setMessage("Product added successfully!");
      // Clear form
      setProductName("");
      setMrp("");
      setCost("");
      setDiscountPercent("");
      setSubcategory("");
      setProductImage("");
      setImagePreview("");
      setCategory("");
      setDescription("");
      setTagline("");
      setSelectedFile(null);
    } else if (status === 'failed') {
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, response, error]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <>
      <Box
        sx={{
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '30px',
            width: '100%'
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {
                imagePreview || productImage ?
                  <ProductImage 
                    src={imagePreview || productImage} 
                    alt="Product preview" 
                    onError={(e) => {
                      e.target.src = altImage;
                      setUploadError("Failed to load image preview");
                    }}
                  />
                  : <ProductImage src={altImage} alt="Default preview" />
              }
            </Stack>
            <form onSubmit={submitHandler}>
              <Stack spacing={3}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      sx={{ mb: 1 }}
                    >
                      Select Image
                    </Button>
                  </label>
                  {selectedFile && (
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      sx={{ ml: 1, mb: 1 }}
                      disabled={loader}
                    >
                      {loader ? <CircularProgress size={24} color="inherit" /> : "Upload Image"}
                    </Button>
                  )}
                  {uploadError && (
                    <Box sx={{ color: 'error.main', mt: 1 }}>
                      {uploadError}
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="MRP"
                  type="number"
                  value={mrp}
                  onChange={(event) => setMrp(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={cost}
                  onChange={(event) => setCost(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Discount Percent"
                  type="number"
                  value={discountPercent}
                  onChange={(event) => setDiscountPercent(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Subcategory"
                  value={subcategory}
                  onChange={(event) => setSubcategory(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  fullWidth
                  label="Tagline"
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Stack>
              <BlueButton
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                variant="contained"
                type="submit"
                disabled={loader}
              >
                {loader ? <CircularProgress size={24} color="inherit" /> : "Add Product"}
              </BlueButton>
            </form>
          </div>
        </Box>
      </Box>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default AddProduct;

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
`;