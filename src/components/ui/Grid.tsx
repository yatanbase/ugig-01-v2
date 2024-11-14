// components/ui/Grid.tsx
"use client";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";

interface GameGridProps {
  handleCellClick: (cell: string) => void;
  selectedCells: Record<string, string>;
  isSelector: boolean;
  isPredictor: boolean;
  gameId: number | null;
}

const GameGrid: React.FC<GameGridProps> = ({
  handleCellClick,
  selectedCells,
  isSelector,
  isPredictor,
  gameId,
}) => {
  const gridItems = Array.from({ length: 64 }, (_, index) => index);

  return (
    <SimpleGrid columns={8} columnGap={2} rowGap={2} p={4}>
      <Toaster />
      {gridItems.map((item) => {
        const row = Math.floor(item / 8);
        const col = item % 8;
        const cell = `${row}-${col}`;
        const isSelected = !!selectedCells[cell]; // Check if selected
        const playerColor = isSelected ? "green.500" : "gray.200"; // Choose color based on selected state

        return (
          <Box
            key={item}
            bg={playerColor} // Apply the dynamic color
            height="50px"
            width="50px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: "gray.300" }}
            onClick={() => {
              if (!isSelector) {
                toaster.create({
                  title: "Not your turn",
                  type: "warning",
                  duration: 2000,
                });
                return; // Or handle it differently if you prefer
              }

              handleCellClick(cell);
            }}
          >
            {isSelected && selectedCells[cell].slice(0, 1).toUpperCase()}{" "}
            {/* Conditionally render the player name/initial*/}
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default GameGrid;
