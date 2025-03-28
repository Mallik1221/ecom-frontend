import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import styled from 'styled-components';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Rating,
  Skeleton,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CachedIcon from '@mui/icons-material/Cached';
import altImage from "../assets/altimg.png";
import { getProductDetails, updateStuff } from '../redux/userHandle';
import { Avatar, Card, Menu, MenuItem } from '@mui/material';
import { generateRandomColor, timeAgo } from '../utils/helperFunctions';
import { MoreVert } from '@mui/icons-material';

const ViewProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { productDetails: product, loading, responseDetails, currentUser, currentRole } = useSelector(state => state.user);
    const [selectedImage, setSelectedImage] = useState('');
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    useEffect(() => {
        dispatch(getProductDetails(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (product?.productImage) {
            setSelectedImage(product.productImage);
        }
    }, [product]);

    const handleImageError = (e) => {
        e.target.src = altImage;
    };

    const calculateDiscount = (mrp, cost) => {
        return Math.round(((mrp - cost) / mrp) * 100);
    };

    const [anchorElMenu, setAnchorElMenu] = useState(null);

    const handleOpenMenu = (event) => {
        setAnchorElMenu(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorElMenu(null);
    };

    const deleteHandler = (reviewId) => {
        const fields = { reviewId };
        dispatch(updateStuff(fields, id, "deleteProductReview"));
    };

    const reviewer = product && product._id;

    const handleAddToCart = () => {
        if (!currentUser || !currentRole) {
            setShowLoginDialog(true);
            return;
        }
        dispatch(addToCart(product));
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    if (loading) {
        return <LoadingContainer>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" width="100%" height={400} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Skeleton variant="text" height={60} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="rectangular" width={200} height={50} sx={{ mt: 2 }} />
                </Grid>
            </Grid>
        </LoadingContainer>;
    }

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary">
                    Product not found
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <ImageSection>
                        <MainImage 
                            src={selectedImage} 
                            alt={product.productName}
                            onError={handleImageError}
                        />
                        <ImageActions>
                            <IconButton aria-label="add to favorites">
                                <FavoriteIcon />
                            </IconButton>
                            <IconButton aria-label="share">
                                <ShareIcon />
                            </IconButton>
                        </ImageActions>
                    </ImageSection>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <ProductInfo>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.productName}
                        </Typography>
                        
                        <Chip 
                            label={product.category} 
                            color="primary" 
                            size="small" 
                            sx={{ mb: 2 }}
                        />
                        
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {product.tagline}
                        </Typography>

                        <Box sx={{ my: 2 }}>
                            <Rating value={4.5} readOnly precision={0.5} />
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                                (245 reviews)
                            </Typography>
                        </Box>

                        <PriceSection>
                            <Typography variant="h4" component="span" color="primary">
                                ₹{product.price?.cost}
                            </Typography>
                            <Typography 
                                variant="h6" 
                                component="span" 
                                color="text.secondary" 
                                sx={{ textDecoration: 'line-through', ml: 2 }}
                            >
                                ₹{product.price?.mrp}
                            </Typography>
                            {product.price?.mrp && product.price?.cost && (
                                <Chip 
                                    label={`${calculateDiscount(product.price.mrp, product.price.cost)}% OFF`}
                                    color="success"
                                    size="small"
                                    sx={{ ml: 2 }}
                                />
                            )}
                        </PriceSection>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>

                        <Features>
                            <FeatureItem>
                                <LocalShippingIcon />
                                <Typography variant="body2">Free Delivery</Typography>
                            </FeatureItem>
                            <FeatureItem>
                                <VerifiedUserIcon />
                                <Typography variant="body2">1 Year Warranty</Typography>
                            </FeatureItem>
                            <FeatureItem>
                                <CachedIcon />
                                <Typography variant="body2">7 Days Replacement</Typography>
                            </FeatureItem>
                        </Features>

                        <ActionButtons>
                            <Button 
                                variant="contained" 
                                size="large" 
                                startIcon={<ShoppingCartIcon />}
                                sx={{ flex: 1, mr: 2 }}
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="large"
                                sx={{ flex: 1 }}
                                onClick={currentUser ? undefined : () => setShowLoginDialog(true)}
                            >
                                Buy Now
                            </Button>
                        </ActionButtons>
                    </ProductInfo>
                </Grid>
            </Grid>
            <ReviewWritingContainer>
                <Typography variant="h4">Reviews</Typography>
            </ReviewWritingContainer>

            {product.reviews && product.reviews.length > 0 ? (
                <ReviewContainer>
                    {product.reviews.map((review, index) => (
                        <ReviewCard key={index}>
                            <ReviewCardDivision>
                                <Avatar 
                                    sx={{ 
                                        width: "60px", 
                                        height: "60px", 
                                        marginRight: "1rem", 
                                        backgroundColor: generateRandomColor(review._id) 
                                    }}
                                >
                                    {review.reviewer?.name ? String(review.reviewer.name).charAt(0) : '?'}
                                </Avatar>
                                <ReviewDetails>
                                    <Typography variant="h6">{review.reviewer?.name}</Typography>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                        <Typography variant="body2">
                                            {timeAgo(review.date)}
                                        </Typography>
                                    </div>
                                    <Typography variant="subtitle1">Rating: {review.rating}</Typography>
                                    <Typography variant="body1">{review.comment}</Typography>
                                </ReviewDetails>
                                {review.reviewer?._id === reviewer && (
                                    <>
                                        <IconButton onClick={handleOpenMenu} sx={{ width: "4rem", color: 'inherit', p: 0 }}>
                                            <MoreVert sx={{ fontSize: "2rem" }} />
                                        </IconButton>
                                        <Menu
                                            id="menu-appbar"
                                            anchorEl={anchorElMenu}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            }}
                                            keepMounted
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'left',
                                            }}
                                            open={Boolean(anchorElMenu)}
                                            onClose={handleCloseMenu}
                                            onClick={handleCloseMenu}
                                        >
                                            <MenuItem onClick={handleCloseMenu}>
                                                <Typography textAlign="center">Edit</Typography>
                                            </MenuItem>
                                            <MenuItem onClick={() => {
                                                deleteHandler(review._id);
                                                handleCloseMenu();
                                            }}>
                                                <Typography textAlign="center">Delete</Typography>
                                            </MenuItem>
                                        </Menu>
                                    </>
                                )}
                            </ReviewCardDivision>
                        </ReviewCard>
                    ))}
                </ReviewContainer>
            ) : (
                <ReviewWritingContainer>
                    <Typography variant="h6">No Reviews Found. Add a review.</Typography>
                </ReviewWritingContainer>
            )}

            <Dialog
                open={showLoginDialog}
                onClose={() => setShowLoginDialog(false)}
                aria-labelledby="login-dialog-title"
            >
                <DialogTitle id="login-dialog-title">
                    Login Required
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Please login to add items to your cart or make a purchase.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowLoginDialog(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleLoginRedirect} 
                        variant="contained" 
                        color="primary"
                    >
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ViewProduct;

const LoadingContainer = styled(Container)`
    padding: 2rem 0;
`;

const ImageSection = styled(Box)`
    position: relative;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MainImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

const ImageActions = styled(Box)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    padding: 0.25rem;
`;

const ProductInfo = styled(Box)`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const PriceSection = styled(Box)`
    display: flex;
    align-items: center;
    margin: 1rem 0;
`;

const Features = styled(Box)`
    display: flex;
    justify-content: space-between;
    margin: 2rem 0;
    padding: 1rem;
    background: #f8f8f8;
    border-radius: 8px;
`;

const FeatureItem = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;

    svg {
        color: ${props => props.theme.palette?.primary?.main || '#1976d2'};
    }
`;

const ActionButtons = styled(Box)`
    display: flex;
    margin-top: auto;
    gap: 1rem;
`;

const ReviewWritingContainer = styled.div`
    margin: 6rem;
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: center;
    flex-direction:column;
`;

const ReviewContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
`;

const ReviewCard = styled(Card)`
    && {
        background-color: white;
        margin-bottom: 2rem;
        padding: 1rem;
    }
`;

const ReviewCardDivision = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
`;

const ReviewDetails = styled.div`
    flex: 1;
`;