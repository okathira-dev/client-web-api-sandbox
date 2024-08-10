import { Box, Button, Flex, Heading, Link, Text } from "@radix-ui/themes";

export function App() {
  return (
    <>
      <Flex direction="column" gap="5">
        <Box>
          <Heading as="h1">keyframe dropping</Heading>
          <Text>original sample codes: </Text>
          <Link href="https://developer.chrome.com/docs/web-platform/best-practices/webcodecs">
            WebCodecs による動画処理 | Web Platform | Chrome for Developers
          </Link>
        </Box>

        <Flex direction="column" gap="4">
          <Flex wrap="wrap" gap="2">
            <canvas width="640" height="480"></canvas>
            <canvas width="640" height="480"></canvas>
          </Flex>
          <Flex gap="2">
            <Button>Start</Button>
            <Button>Stop</Button>
            <Button>Play</Button>
            <Button>Pause</Button>
            <Button>Double</Button>
            <Button>Drop</Button>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
