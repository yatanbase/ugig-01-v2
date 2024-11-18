// components/ui/Grid.tsx
"use client";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";

interface GameGridProps {
  handleCellClick: (cell: string) => void;
  selectedCells: Record<string, string>; // Change to store all selected and predicted cells
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
  const [selectedCellByMe, setSelectedCellByMe] = useState<string | null>(null); // To track MY selection
  const [predictedCellByMe, setPredictedCellByMe] = useState<string | null>(
    null
  ); // To track MY prediction

  useEffect(() => {
    console.log("isSelector: ", isSelector);
    console.log("isPredictor: ", isPredictor);
    console.log("disabledCells: ", disabledCells);
    console.log("isPredictionEnabled: ", isPredictionEnabled);
    console.log("selectedCells", selectedCells);
  }, [
    isSelector,
    isPredictor,
    disabledCells,
    isPredictionEnabled,
    selectedCells,
  ]);
  useEffect(() => {
    if (isPredictionEnabled || isSelector) {
      setPredictedCellByMe(null);
    }
  }, [isPredictionEnabled]);

  return (
    <Box width={{ base: "300px", md: "400px", lg: "500px" }}>
      <SimpleGrid
        columns={8}
        columnGap={2}
        rowGap={2}
        p={4}
        width={{ base: "100%", md: "500px", lg: "500px" }}
      >
        <Toaster />
        {gridItems.map((item) => {
          const row = Math.floor(item / 8);
          const col = item % 8;
          const cell = `${row}-${col}`;

          const isDisabled = disabledCells.includes(cell);
          const isSelectedByMe = cell === selectedCellByMe;
          const isPredictedByMe = cell === predictedCellByMe;

          let bgColor = "gray.100"; // Default: Unselected

          if (isDisabled) {
            bgColor = "gray.500"; // Disabled: Dark gray
          } else if (isSelectedByMe) {
            bgColor = "green.500"; // Selected by me: Green
          } else if (isPredictedByMe) {
            bgColor = "blue.200"; // Predicted by me: blue
          } else if (selectedCells[cell]) {
            bgColor = "green.500"; // Selected by opponent: Green (Predictor shouldn't see different color)
          }

          return (
            <Box
              key={item}
              bg={bgColor}
              width={{ base: "30px", md: "50px", lg: "50px" }}
              height={{ base: "30px", md: "50px", lg: "50px" }}
              marginRight={{ base: "2px", md: "0px" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              rowGap={0}
              borderRadius="md"
              cursor={
                isDisabled ||
                (!isSelector && !isPredictionEnabled) ||
                (isPredictor && !isPredictionEnabled)
                  ? "not-allowed"
                  : "pointer"
              }
              _hover={
                !isDisabled &&
                !isPredictedByMe &&
                !isSelectedByMe &&
                ((isSelector && !isPredictionEnabled) ||
                  (isPredictor && isPredictionEnabled))
                  ? { bg: "gray.300" }
                  : {}
              }
              onClick={() => {
                if (predictedCellByMe == cell) {
                  return;
                }
                if (
                  isDisabled ||
                  (!isSelector && !isPredictionEnabled) ||
                  (isPredictor && !isPredictionEnabled)
                ) {
                  toaster.create({
                    type: "warning",
                    title: "Not your move!",
                    duration: 2000,
                  });
                } else {
                  handleCellClick(cell);
                  if (isSelector) {
                    setSelectedCellByMe(cell); // Update my selected cell
                  } else if (isPredictor) {
                    setPredictedCellByMe(cell); // Update my predicted cell
                  }
                }
              }}
            >
              {/* Display initials only if selected or predicted BY ME or disabled  */}
              {(isSelectedByMe || isPredictedByMe || isDisabled) &&
                selectedCells[cell] &&
                selectedCells[cell].slice(0, 1).toUpperCase()}
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default GameGrid;
