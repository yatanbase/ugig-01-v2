"use client"; // This is crucial for client-side components

import {
  Heading,
  Box,
  Button,
  VStack,
  Container,
  Input,
  Stack,
  Fieldset,
  useRatingGroupItemContext,
} from "@chakra-ui/react";
import { Toaster, toaster } from "../../../components/ui/toaster";
import { Field } from "@/components/ui/field";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // For more specific error display
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Get error details
        if (errorData.message) {
          setError(errorData.message); // Set specific error message
          toaster.create({
            title: errorData.message, // Display the server message
            type: "error",
            duration: 3000,
          });
        } else {
          setError("Login failed."); // Generic message if no specific message is provided
          toaster.create({
            title: "Login failed.",
            type: "error",
            duration: 3000,
          });
        }
        return;
      }

      // Login successful
      const data = await response.json();
      console.log(data);
      toaster.create({
        title: "Login successful.",
        description: "You have successfully logged in.",
        type: "success",
        duration: 6000,
      });
      router.push("/"); // Redirect using next/navigation
    } catch (error) {
      // Handle unexpected errors
      setError("An unexpected error occurred.");
      toaster.create({
        title: "An unexpected error occurred.",
        type: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="md" centerContent p={4}>
      <Toaster />
      <Heading as="h1" size="lg" mb={4}>
        Login
      </Heading>

      <Box as="form" onSubmit={handleSubmit} width="100%">
        <Fieldset.Root size="lg" maxW="md">
          <Stack>
            <Fieldset.Legend>Login</Fieldset.Legend>
            <Fieldset.HelperText>
              Please provide your login details below.
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Field label="Username" required>
              <Input
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>

            <Field label="Password" required>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </Fieldset.Content>

          <Button
            type="submit"
            alignSelf="flex-start"
            colorScheme="teal"
            size="lg"
          >
            Login
          </Button>
        </Fieldset.Root>
      </Box>
    </Container>
  );
}
