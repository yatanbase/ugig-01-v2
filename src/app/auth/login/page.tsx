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
  Badge,
} from "@chakra-ui/react";
import { Toaster, toaster } from "../../../components/ui/toaster";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaBold } from "react-icons/fa";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useMemo } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [init, setInit] = useState(false);
  const router = useRouter();
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container: any) => {
    console.log(container);
  };

  const particlesOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "#000000",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
          resize: true,
        },
        modes: {
          push: {
            quantity: 2,
          },
          repulse: {
            distance: 100,
            duration: 0.2,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 100,
          enable: true,
          opacity: 0.6,
          width: 0.5,
        },
        collisions: {
          enable: true,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 40,
        },
        opacity: {
          value: 0.3,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

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
          });
        } else {
          setError("Login failed."); // Generic message if no specific message is provided
          toaster.create({
            title: "Login failed.",
            type: "error",
          });
        }
        return;
      }

      const data = await response.json();
      sessionStorage.setItem("token", data.access_token);
      sessionStorage.setItem("username", data.username);
      toaster.create({
        title: "Login successful.",
        description: "You have successfully logged in.",
        type: "success",
      });
      router.push("/play");
    } catch (error) {
      setError("An unexpected error occurred.");
      toaster.create({
        title: "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  return (
    <Box
      className="bg-zinc-800"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      p={8}
    >
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={particlesOptions}
        />
      )}
      <Container
        className="bg-black border-solid border-gray-50"
        maxW="md"
        p={6}
        border="1px solid"
        borderColor="gray" // Teal border color
        borderRadius="md"
        boxShadow="lg"
        // Darker gray background for the container
      >
        <Toaster />
        <Heading
          as="h1"
          fontSize="2xl"
          fontWeight={"bold"}
          mb={4}
          textAlign="center"
        >
          Login
        </Heading>

        <Box as="form" zIndex={1000} onSubmit={handleSubmit} width="100%">
          <Fieldset.Root size="lg" alignItems={"center"}>
            <Stack rowGap={4}>
              <Fieldset.HelperText textAlign="center">
                Please provide your login details below.
              </Fieldset.HelperText>
            </Stack>

            <Fieldset.Content>
              <Field label="Username" required>
                <InputGroup
                  flex="1"
                  width="100%"
                  margin={2}
                  startElement={<FaUser />}
                >
                  <Input
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </InputGroup>
              </Field>

              <Field label="Password" required>
                <InputGroup
                  margin={2}
                  marginBottom={4}
                  flex="1"
                  width="100%"
                  startElement={<FaLock />}
                >
                  <Input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="transparent" // Dark background for input
                    borderColor="gray" // Teal border for input
                    // Lighter teal on focus
                    placeholder="Enter your password"
                    color="white"
                  />
                </InputGroup>
              </Field>
            </Fieldset.Content>

            <Button
              display={"flex"}
              onClick={handleSubmit}
              colorScheme="blue"
              width="40%"
              padding="6"
              fontWeight="bold"
              className="bg-white text-black hover:bg-zinc-200 hover:text-gray-800 "
            >
              Login
            </Button>
          </Fieldset.Root>
        </Box>
      </Container>
    </Box>
  );
}
