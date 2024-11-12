"use client"; // This is crucial for client-side components

import {
  Heading,
  Box,
  Button,
  Container,
  Input,
  Stack,
  Fieldset,
} from "@chakra-ui/react";
import { Toaster, toaster } from "../../../components/ui/toaster";
import { Field } from "@/components/ui/field";
import { useState ,useEffect,useMemo} from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation
import { FaUser,FaLock, FaBold } from 'react-icons/fa';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [init, setInit] = useState(false);
  const [error, setError] = useState<string | null>(null); // For more specific error display
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
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
          setError("Signup failed."); // Generic message if no specific message is provided
          toaster.create({
            title: "Signup failed.",
            type: "error",
            duration: 3000,
          });
        }
        return;
      }

      // Signup successful
      toaster.create({
        title: "Account created.",
        description: "We've created your account for you.",
        type: "success",
        duration: 6000,
      });
      router.push("/auth/login"); // Redirect using next/navigation
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

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
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
        borderColor="gray"
        borderRadius="md"
        boxShadow="lg"
      >
        <Toaster />
        <Heading as="h1" fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
          Sign Up
        </Heading>

        <Box as="form" onSubmit={handleSubmit} width="100%">
          <Fieldset.Root size="lg">
            <Stack rowGap={4}>
              <Fieldset.HelperText textAlign="center">
                
                Please provide your details below.
              </Fieldset.HelperText>
            </Stack>

            <Fieldset.Content>
              <Field label="Username" required>
                <Input
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  bg="transparent"
                  borderColor="gray"
                  placeholder="Enter your username"
                  color="white"
                  padding="4"
                />
              </Field>

              <Field label="Email address" required>
                <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="transparent"
                  borderColor="gray"
                  placeholder="Enter your email"
                  color="white"
                  padding="4"
                />
              </Field>

              <Field label="Password" marginBottom={6} required>
                <Input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="transparent"
                  borderColor="gray"
                  placeholder="Enter your password"
                  color="white"
                  padding="4"
                />
              </Field>
            </Fieldset.Content>

            <Button
              type="submit"
              display="flex"
              colorScheme="blue"
              width="40%"
              padding="6"
              fontWeight="bold"
              className="bg-white text-black hover:bg-zinc-200 hover:text-gray-800 "
              alignSelf="center"
            >
              Sign Up
            </Button>
          </Fieldset.Root>
        </Box>
      </Container>
    </Box>
  );
}
