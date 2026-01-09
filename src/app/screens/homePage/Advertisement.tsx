import React from "react";
import { Box, Container, Stack, Typography, Button } from "@mui/material";
import { MenuBook, ArrowForward } from "@mui/icons-material";
import { useHistory } from "react-router-dom";

export default function Advertisement() {
    const history = useHistory();

    const handleExploreClick = () => {
        history.push("/products");
    };

    return (
    <div className="ads-restaurant-frame">
        <div className="ads-background">
            <div className="floating-books">
                <span className="book-float book-1">📚</span>
                <span className="book-float book-2">📖</span>
                <span className="book-float book-3">📕</span>
                <span className="book-float book-4">📗</span>
                <span className="book-float book-5">📘</span>
                <span className="book-float book-6">📙</span>
            </div>
        </div>
        <Container className="ads-content">
            <Stack className="ads-overlay">
                <Box className="ads-icon-wrapper">
                    <MenuBook className="ads-icon" />
                </Box>
                <Typography className="ads-main-text">
                    Welcome to the World of Books!
                </Typography>
                <Typography className="ads-sub-text">
                    Thousands of books are waiting for you. Start reading and discover new worlds
                </Typography>
                <Button 
                    className="ads-explore-button"
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleExploreClick}
                >
                    Explore Books
                </Button>
            </Stack>
        </Container>
    </div>
   );
}