"use client";

import {
  Box,
  Container,
  Heading,
  HStack,
  Button,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import OnlineUsers from "../components/ui/OnlineUsers";
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";

export default function Home() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const handleLaunchGame = () => {
    // You would navigate to /play on button click here
    router.push("/play");
    console.log("Launching game...");
  };

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" p={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <DrawerRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
            <DrawerBackdrop />
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                ...
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <VStack rowGap={4} align="start">
                  <Link href="/auth/login">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button colorScheme="teal" onClick={() => setOpen(false)}>
                      Sign Up
                    </Button>
                  </Link>
                </VStack>
              </DrawerBody>
              <DrawerFooter>
                <DrawerActionTrigger asChild>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </DrawerActionTrigger>
              </DrawerFooter>
              <DrawerCloseTrigger />
            </DrawerContent>
          </DrawerRoot>

          <Heading
            as="h1"
            size="xl"
            textAlign="center"
            flexGrow={1}
            fontFamily={"Roboto"}
            fontSize={{ base: "2xl", md: "3xl" }}
          >
            UGIG
          </Heading>

          <HStack columnGap={4} display={{ base: "none", md: "flex" }}>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button colorScheme="teal">Sign Up</Button>
            </Link>
          </HStack>
        </Flex>

        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="80vh"
          mt={12}
        >
          <VStack rowGap={10} align="center">
            <Image
              src={"/gamelogo.jpg"}
              alt="Game Logo"
              width={200}
              height={300}
            />
            <Button
              className="bg-gradient-to-r from-teal-400 to-teal-500 px-4"
              size="lg"
              onClick={() => {
                // You would navigate to /play on button click here
                handleLaunchGame();
              }}
            >
              Launch Game
            </Button>
            <OnlineUsers />
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}
