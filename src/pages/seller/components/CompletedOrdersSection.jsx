import { useDispatch, useSelector } from "react-redux";
import { getSpecificProducts } from "../../../redux/userHandle";
import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { BlueButton, GreenButton } from "../../../utils/buttonStyles";
import TableTemplate from "../../../components/TableTemplate";
import { useNavigate } from "react-router-dom";

const CompletedOrdersSection = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { currentUser, specificProductData, responseSpecificProducts } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getSpecificProducts(currentUser._id, "getOrdersByStatus", "Delivered"));
    }, [dispatch, currentUser._id])

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

    const ProductsButtonHaver = ({ row }) => {
        return (
            <Typography variant="body2" color="success.main">
                Delivered
            </Typography>
        );
    };

    return (
        <>
            {responseSpecificProducts ?
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <Typography variant="h6">
                        No Completed Orders
                    </Typography>
                </Box>
                :
                <>
                    <Typography variant="h5" gutterBottom>
                        Completed Orders:
                    </Typography>

                    <TableTemplate buttonHaver={ProductsButtonHaver} columns={productsColumns} rows={productsRows} />
                </>
            }
        </>
    )
}

export default CompletedOrdersSection; 