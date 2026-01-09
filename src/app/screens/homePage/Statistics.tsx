import React from "react";
import { Box, Container, Stack } from "@mui/material";
import { MenuBook, People, LocalLibrary, Star } from "@mui/icons-material";

export default function Statistics() {
    return (
    <div className={"static-frame"}>
        <Container>
            <Stack className={"info"}>
                <Stack className={"static-box"}>
                    <Box className={"static-icon-wrapper"}>
                        <MenuBook className={"static-icon"} />
                    </Box>
                    <Box className={"static-num"}>5000+</Box>
                    <Box className={"static-text"}>Books</Box>
                </Stack>

                <Box className={"divider-line"}></Box>

                <Stack className={"static-box"}>
                    <Box className={"static-icon-wrapper"}>
                        <People className={"static-icon"} />
                    </Box>
                    <Box className={"static-num"}>10K+</Box>
                    <Box className={"static-text"}>Customers</Box>
                </Stack>

                <Box className={"divider-line"}></Box>

                <Stack className={"static-box"}>
                    <Box className={"static-icon-wrapper"}>
                        <LocalLibrary className={"static-icon"} />
                    </Box>
                    <Box className={"static-num"}>15+</Box>
                    <Box className={"static-text"}>Years Experience</Box>
                </Stack>

                <Box className={"divider-line"}></Box>

                <Stack className={"static-box"}>
                    <Box className={"static-icon-wrapper"}>
                        <Star className={"static-icon"} />
                    </Box>
                    <Box className={"static-num"}>4.9</Box>
                    <Box className={"static-text"}>Rating</Box>
                </Stack>
            </Stack>
        </Container>
        </div>
   );
}