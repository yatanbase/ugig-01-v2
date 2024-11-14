// components/ui/Grid.tsx
"use client";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

interface GameGridProps {
  handleCellClick: (cell: string) => void;
  selectedCells: Record<string, string>;
  isSelector: boolean;
  isPredictor: boolean;
  disabledCells: string[];
  isPredictionEnabled: boolean;
  gameId: number;
}

const GameGrid: React.FC<GameGridProps> = ({
  handleCellClick,
  selectedCells,
  isSelector,
  isPredictor,
  disabledCells,
  isPredictionEnabled,
  gameId,
}) => {
  const gridItems = Array.from({ length: 64 }, (_, index) => index);
  useEffect(() => {
    console.log("isSelector: ", isSelector);
    console.log("isPredictor: ", isPredictor);
    console.log("disabledCells: ", disabledCells);
    console.log("isPredictionEnabled: ", isPredictionEnabled);
  }, [isSelector, isPredictor, disabledCells, isPredictionEnabled]);
  return (
    <SimpleGrid columns={8} columnGap={2} rowGap={2} p={4}>
      <Toaster />
      {gridItems.map((item) => {
        const row = Math.floor(item / 8);
        const col = item % 8;
        const cell = `${row}-${col}`;
        const cellOwner = selectedCells[cell];
        console.log("cellOwner", cellOwner);
        // const isSelected = cell === selectedCell;
        // const isPredicted = selectedCells[cell];
        // const playerColor = isSelected ? "green.500" : "gray.200"; // Choose color based on selected state

        return (
          <Box
            key={item}
            bg={
              cellOwner
                ? isPredictionEnabled
                  ? "blue.200" // During prediction phase
                  : "green.500" // During selection phase
                : "gray.100" // Unselected cell
            }
            height="50px"
            width="50px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            cursor={
              disabledCells.includes(cell) ||
              (!isSelector && !isPredictionEnabled) ||
              (isPredictor && !isPredictionEnabled)
                ? "not-allowed"
                : "pointer"
            }
            _hover={{ bg: "gray.300" }}
            onClick={() => {
              if (
                disabledCells.includes(cell) ||
                (!isSelector && !isPredictionEnabled) ||
                (isPredictor && !isPredictionEnabled)
              ) {
                toaster.create({
                  type: "warning",
                  title: "not ur move mate!",
                  duration: 2000,
                });
              } else {
                handleCellClick(cell);
              }
            }}
          >
            {cellOwner && cellOwner.slice(0, 1).toUpperCase()}
            {/* Conditionally render the player name/initial*/}
          </Box>
        );
      })}
    </SimpleGrid>
  );
};

export default GameGrid;
