import {
  Button,
  chakra,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
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
import { LinkIcon } from "@chakra-ui/icons";
import { EXTERNAL_URLS } from "../src/constants";

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
      <DrawerFooter>
        <Button
          as="a"
          target="_blank"
          href={EXTERNAL_URLS.OFFICIAL_WEBPAGE}
          bgColor="brand.700"
          _hover={{ bgColor: "brand.800" }}
          _active={{ bgColor: "brand.900" }}
          color="white"
          width="100%"
          leftIcon={<LinkIcon />}
        >
          Metro de Granada
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);

export default RightDrawer;
