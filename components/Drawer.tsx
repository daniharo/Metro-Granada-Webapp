import {
  chakra,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  UseCounterProps,
} from "@chakra-ui/react";
import React from "react";

interface IDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lastDataTime: string;
  onChangeDecimals: UseCounterProps["onChange"];
  decimals: number;
}

const RightDrawer: React.FC<IDrawerProps> = ({
  isOpen,
  onClose,
  lastDataTime,
  onChangeDecimals,
  decimals,
}) => (
  <Drawer isOpen={isOpen} onClose={onClose}>
    <DrawerOverlay />
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader></DrawerHeader>
      <DrawerBody>
        <Flex flexDirection="column">
          <strong>Hora de los últimos datos:</strong>
          <chakra.span mb={4}>{lastDataTime}</chakra.span>
          <FormLabel htmlFor="decimales">
            <strong>Decimales</strong>
          </FormLabel>
          <NumberInput
            id="decimales"
            value={decimals}
            onChange={onChangeDecimals}
            min={0}
            max={3}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Flex>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

export default RightDrawer;
