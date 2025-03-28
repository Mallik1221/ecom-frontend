import { useDispatch, useSelector } from "react-redux";
import { getSpecificProducts, updateOrderStatus } from "../../../redux/userHandle";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { BlueButton, GreenButton, DarkRedButton } from "../../../utils/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import { useNavigate } from "react-router-dom";
import Popup from "../../../components/Popup";

const AddedToCartSection = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { currentUser, specificProductData, responseSpecificProducts, status } = useSelector(state => state.user);

    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        dispatch(getSpecificProducts(currentUser._id, "getOrderedProductsBySeller"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (status === 'success') {
            setMessage("Order Status Updated Successfully");
            setShowPopup(true);
            dispatch(getSpecificProducts(currentUser._id, "getOrderedProductsBySeller"));
        }
    }, [status, dispatch, currentUser._id]);

    const formatAddress = (buyerInfo) => {
        if (!buyerInfo) return 'Address not available';
        const { address, city, state, pinCode } = buyerInfo;
        return [address, city, state, pinCode].filter(Boolean).join(', ');
    };

    const productsColumns = [
        { id: 'name', label: 'Product Name', minWidth: 170 },
        { id: 'quantity', label: 'Product Quantity', minWidth: 100 },
        { id: 'category', label: 'Product Category', minWidth: 100 },
        { id: 'subcategory', label: 'Product SubCategory', minWidth: 100 },
        { id: 'orderedAt', label: 'Order Date', minWidth: 120 },
        { id: 'address', label: 'Delivery Address', minWidth: 200 },
    ];

    const productsRows = Array.isArray(specificProductData) && specificProductData.length > 0
        ? specificProductData
            .filter(product => product.orderStatus === 'Processing')
            .map((product) => ({
                name: product.productName || 'N/A',
                quantity: product.quantity || 0,
                category: product.category || 'N/A',
                subcategory: product.subcategory || 'N/A',
                orderedAt: product.orderedAt ? new Date(product.orderedAt).toLocaleDateString() : 'N/A',
                address: formatAddress(product.buyerInfo),
                id: `${product._id || ''}${product.orderId || ''}`,
                productID: product._id,
                orderId: product.orderId,
                orderStatus: product.orderStatus
            }))
        : [];

    const handleStatusUpdate = (orderId, newStatus) => {
        dispatch(updateOrderStatus(orderId, newStatus));
    };

    const ProductsButtonHaver = ({ row }) => {
        return (
            <>
                <BlueButton
                    onClick={() => navigate("/Seller/orders/product/" + row.productID)}
                >
                    View Product
                </BlueButton>
                <GreenButton
                    onClick={() => handleStatusUpdate(row.orderId, "Out For Delivery")}
                    sx={{ ml: 1 }}
                >
                    Out For Delivery
                </GreenButton>
                <DarkRedButton
                    onClick={() => handleStatusUpdate(row.orderId, "Cancelled")}
                    sx={{ ml: 1 }}
                >
                    Cancel Order
                </DarkRedButton>
            </>
        );
    };

    return (
        <>
            {responseSpecificProducts ?
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <Typography variant="h6">
                        No Orders Found
                    </Typography>
                </Box>
                :
                <>
                    <Typography variant="h5" gutterBottom>
                        New Orders:
                    </Typography>

                    <TableTemplate buttonHaver={ProductsButtonHaver} columns={productsColumns} rows={productsRows} />
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddedToCartSection;