import { useDispatch, useSelector } from "react-redux";
import { getSpecificProducts, updateOrderStatus } from "../../../redux/userHandle";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { GreenButton, DarkRedButton } from "../../../utils/buttonStyles";
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
        // Fetch orders with Processing status
        dispatch(getSpecificProducts(currentUser._id, "getOrdersByStatus", "Processing"));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (status === 'success') {
            setMessage("Order Status Updated Successfully");
            setShowPopup(true);
            // Refresh the orders list after status update
            dispatch(getSpecificProducts(currentUser._id, "getOrdersByStatus", "Processing"));
        }
    }, [status, dispatch, currentUser._id]);

    // Debug log to see the data structure
    useEffect(() => {
        console.log("Orders Data:", specificProductData);
    }, [specificProductData]);

    const formatAddress = (order) => {
        if (!order) return 'Address not available';
        const { address, city, state, pinCode } = order;
        return [address, city, state, pinCode].filter(Boolean).join(', ');
    };

    const productsColumns = [
        { id: 'customerName', label: 'Customer Name', minWidth: 170 },
        { id: 'productName', label: 'Product Name', minWidth: 170 },
        { id: 'quantity', label: 'Quantity', minWidth: 100 },
        { id: 'price', label: 'Price', minWidth: 100 },
        { id: 'address', label: 'Delivery Address', minWidth: 200 },
        { id: 'orderDate', label: 'Order Date', minWidth: 120 },
    ];

    const productsRows = Array.isArray(specificProductData) && specificProductData.length > 0
        ? specificProductData.map((order) => ({
            customerName: order.customerName || 'N/A',
            productName: order.productName || 'N/A',
            quantity: order.quantity || 0,
            price: order.price && order.price.cost ? `₹${order.price.cost}` : 'N/A',
            address: order.address || 'N/A',
            orderDate: order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : 'N/A',
            id: order.orderId || order._id,
            orderId: order.orderId || order._id,
            orderStatus: order.orderStatus
        }))
        : [];

    const handleStatusUpdate = (orderId, newStatus) => {
        dispatch(updateOrderStatus(orderId, newStatus));
    };

    const ProductsButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <GreenButton
                    onClick={() => handleStatusUpdate(row.orderId, "Out For Delivery")}
                    sx={{ 
                        fontSize: '0.8rem',
                        padding: '4px 8px',
                        minWidth: '120px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    OUT FOR DELIVERY
                </GreenButton>
                <DarkRedButton
                    onClick={() => handleStatusUpdate(row.orderId, "Cancelled")}
                    sx={{ 
                        fontSize: '0.8rem',
                        padding: '4px 8px',
                        minWidth: '120px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    CANCEL ORDER
                </DarkRedButton>
            </Box>
        );
    };

    return (
        <>
            {responseSpecificProducts ?
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <Typography variant="h6">
                        No New Orders Found
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