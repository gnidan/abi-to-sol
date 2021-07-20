import React from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { Page, Container } from "./Layout";
import { Footer } from "./Footer";
import * as Abi from "./abi";
import * as Solidity from "./solidity";

function App() {
  return (
    <div style={{
      height: "100vh",
      padding: "1em"
    }}>
      <ChakraProvider>
        <Abi.Input.Container.Provider
          initialState={JSON.stringify([
            { type: "event", name: "Magic", inputs: [], anonymous: false }
          ], undefined, 2)}
        >
          <Solidity.Options.Container.Provider>
            <Abi.Examples.Container.Provider>
              <Solidity.Output.Container.Provider>
                <Flex height="100%" direction="column">
                  <Box order={2}>
                    <Divider />
                    <Footer />
                  </Box>

                  <Page order={0}>
                    <Container order={0}>
                      <Abi.Header />
                    </Container>
                    <Container order={2}>
                      <Solidity.OptionsControls />
                    </Container>
                    <Container order={4}>
                      <Divider />
                    </Container>

                    <Container order={1}>
                      <Solidity.Header />
                    </Container>
                    <Container order={3}>
                      <Solidity.Controls />
                    </Container>
                    <Container order={5}>
                      <Divider />
                    </Container>
                  </Page>

                  <Page
                    flex="1 1 auto"
                    height="100%"
                    overflow="hidden"
                    order={1}
                  >
                    <Container flex={1}>
                      <Abi.Editor />
                    </Container>

                    <Container height="100%" overflow="scroll">
                        <Solidity.Code />
                    </Container>
                  </Page>

                </Flex>
              </Solidity.Output.Container.Provider>
            </Abi.Examples.Container.Provider>
          </Solidity.Options.Container.Provider>
        </Abi.Input.Container.Provider>
          {/*<Layout />*/}
      </ChakraProvider>
    </div>
  );
}

export default App;
